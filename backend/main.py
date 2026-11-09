
import secrets


from fastapi.responses import RedirectResponse

from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
 
from models import URL, Click , User
from database import engine, Base, SessionLocal
from schemas import (
    URLRequest,
    URLResponse,
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)
from fastapi import FastAPI, HTTPException, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

app = FastAPI(
    title="LinkFlow API",
    description="URL Shortener with Click Analytics and Rate Limiting",
    version="1.0.0"
)
@app.get("/healthz")
def health_check():
    return {"status": "ok"}

limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"]
)
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    return response
  
Base.metadata.create_all(bind=engine)


# ---------------- AUTHENTICATION ----------------

@app.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
@limiter.limit("5/minute")
def register_user(request: Request, user_data: UserRegister):

    db = SessionLocal()

    try:
        email = str(user_data.email).lower()

        existing_user = db.query(User).filter(
            User.email == email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email is already registered"
            )

        new_user = User(
            name=user_data.name.strip(),
            email=email,
            hashed_password=hash_password(user_data.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email is already registered"
        )

    finally:
        db.close()


# ---------------- CURRENT USER AUTHENTICATION ----------------

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(credentials.credentials)

    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User no longer exists"
            )

        return user

    finally:
        db.close()


@app.post("/auth/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login_user(request: Request, user_data: UserLogin):

    db = SessionLocal()

    try:
        email = str(user_data.email).lower()

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user or not verify_password(
            user_data.password,
            user.hashed_password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            {"sub": str(user.id)}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    finally:
        db.close()
@app.get("/auth/me", response_model=UserResponse)
def get_logged_in_user(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }

@app.get("/")
def home():
    return {
        "message": "Welcome to LinkFlow!",
        "status": "API is running successfully"
    }


@app.post("/shorten", response_model=URLResponse)
@limiter.limit("10/minute")
def shorten_url(
    request: Request,
    url_data: URLRequest,
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    try:
        for attempt in range(5):
            short_code = secrets.token_urlsafe(6)

            new_url = URL(
                original_url=str(url_data.original_url),
                short_code=short_code,
                user_id=current_user.id
)
            db.add(new_url)

            try:
                db.commit()
                db.refresh(new_url)

                return URLResponse(
                    original_url=new_url.original_url,
                    short_code=new_url.short_code,
                    short_url=f"http://127.0.0.1:8000/{new_url.short_code}"
                )

            except IntegrityError:
                db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not generate a unique short code. Try again."
        )

    finally:
        db.close()

# ---------------- USER'S PRIVATE LINKS ----------------

@app.get("/my-links")
def get_my_links(
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        user_urls = db.query(URL).filter(
            URL.user_id == current_user.id
        ).order_by(URL.created_at.desc()).all()

        result = []

        for url in user_urls:
            total_clicks = db.query(Click).filter(
                Click.url_id == url.id
            ).count()

            result.append({
                "id": url.id,
                "original_url": url.original_url,
                "short_code": url.short_code,
                "short_url": f"http://127.0.0.1:8000/{url.short_code}",
                "created_at": url.created_at,
                "total_clicks": total_clicks
            })

        return result

    finally:
        db.close()


@app.get("/{short_code}")
def redirect_url(short_code: str, request: Request):

    db = SessionLocal()

    try:
        url_record = db.query(URL).filter(
            URL.short_code == short_code
        ).first()

        if not url_record:
            raise HTTPException(
                status_code=404,
                detail="Short URL not found"
            )

        # Record the click
        new_click = Click(
            url_id=url_record.id,
            referrer=request.headers.get("referer")
        )

        db.add(new_click)
        db.commit()

        return RedirectResponse(
            url=url_record.original_url,
            status_code=307
        )

    finally:
        db.close()


@app.get("/stats/{short_code}")
def get_url_stats(
    short_code: str,
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    
    try:
        # Find the URL
        url_record = db.query(URL).filter(
            URL.short_code == short_code
        ).first()

        if not url_record:
            raise HTTPException(
                status_code=404,
                detail="Short URL not found"
            )

        # Check ownership
        if url_record.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view these analytics"
            )


        # Calculate total clicks
        total_clicks = db.query(func.count(Click.id)).filter(
            Click.url_id == url_record.id
        ).scalar() or 0

        # Calculate daily clicks
        daily_clicks = db.query(
            func.date(Click.clicked_at).label("date"),
            func.count(Click.id).label("clicks")
        ).filter(
            Click.url_id == url_record.id
        ).group_by(
            func.date(Click.clicked_at)
        ).order_by(
            func.date(Click.clicked_at)
        ).all()

        return {
            "original_url": url_record.original_url,
            "short_code": url_record.short_code,
            "total_clicks": total_clicks,
            "daily_clicks": [
                {
                    "date": str(row.date),
                    "clicks": row.clicks
                }
                for row in daily_clicks
            ]
        }

    finally:
        db.close()
