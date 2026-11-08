from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to LinkFlow!"
    
def test_shorten_url():
    response = client.post(
        "/shorten",
        json={"original_url": "https://www.google.com"}
    )

    assert response.status_code == 200

    data = response.json()

    assert data["original_url"] == "https://www.google.com/"
    assert "short_code" in data
    assert "short_url" in data
    
def test_redirect_url():
    shorten_response = client.post(
        "/shorten",
        json={"original_url": "https://www.google.com"}
    )

    short_code = shorten_response.json()["short_code"]

    redirect_response = client.get(
        f"/{short_code}",
        follow_redirects=False
    )

    assert redirect_response.status_code == 307
    assert redirect_response.headers["location"] == "https://www.google.com/"
    
def test_url_analytics():
    shorten_response = client.post(
        "/shorten",
        json={"original_url": "https://www.google.com"}
    )

    short_code = shorten_response.json()["short_code"]

    client.get(
        f"/{short_code}",
        follow_redirects=False
    )

    stats_response = client.get(f"/stats/{short_code}")

    assert stats_response.status_code == 200

    data = stats_response.json()

    assert data["total_clicks"] == 1
    assert "daily_clicks" in data


def test_invalid_url():
    response = client.post(
        "/shorten",
        json={"original_url": "not-a-valid-url"}
    )

    assert response.status_code == 422


def test_nonexistent_short_code():
    response = client.get("/thiscode-does-not-exist")

    assert response.status_code == 404
    assert response.json()["detail"] == "Short URL not found"