# LinkFlow Frontend

React + Vite + Tailwind CSS client for the LinkFlow FastAPI backend.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

The backend URL is read from `.env` (`VITE_API_URL`, default `http://127.0.0.1:8000`).
The backend must allow this origin via CORS (e.g. `http://localhost:5173`).

## Structure

```
src/
  api/         axios client (JWT interceptor) + endpoint services
  context/     AuthContext (login, register, logout, persistent session)
  hooks/       useLinks
  utils/       formatters, response normalizers
  components/  reusable UI, layout, route guards, ShortenForm, LinkRow
  pages/       Landing, Login, Register, Dashboard, MyLinks, Analytics, NotFound
```

## If your API field names differ

- Request payloads: `src/api/services.js`
- Response shapes (link and stats fields): `src/utils/normalize.js`
