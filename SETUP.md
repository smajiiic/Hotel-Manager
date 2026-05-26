# Setup — IsaBegov Hamam Hotel Service Tracker

Prerequisites: Node.js 18+, MongoDB 6+, Git. Tested on Windows with Git Bash.

## Quick start

1. Clone: `git clone https://github.com/Spahaaa/Hotel-Manager.git`
2. Verify `.env` at the root has `MONGO_URI=mongodb://localhost:27017/hotelDB`
3. Install backend deps: `cd backend && npm install && cd ..`
4. Install frontend deps: `cd frontend && npm install && cd ..`
5. Start MongoDB (Windows service or `mongod` directly)
6. Seed: `node seed.js` from the project root
7. Start backend: `cd backend && node app.js` — listens on port 5050
8. Start frontend in a new terminal: `cd frontend && npm run dev -- --port 3000`
9. Open http://localhost:3000 and log in

## Login credentials (seeded)

- `admin` / `admin123` (manager)
- `reception1` / `test1234` (reception)
- `cleaning1` / `test1234` (cleaning)
- `manager1` / `test1234` (manager)

## Troubleshooting

**Login shows "Something went wrong"**: MongoDB isn't running, backend isn't running, or DB not seeded. Test directly: `curl -i -X POST http://localhost:5050/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'` should return HTTP 200.

**Port 5000 returns `Server: Kestrel`**: That's a Windows .NET service. We use port 5050 instead.

**Frontend boots on 3001/3002**: Stale Vite process holds 3000. Find with `netstat -ano | grep -E ':300[01]\s'` and kill with `taskkill //PID <pid> //F`.

**Backend errors `Cannot find module 'cors'`**: Run `npm install` inside `backend/`.

## Project structure

- `backend/` — Node + Express + Mongoose API (port 5050)
- `frontend/` — React + Vite dev server (port 3000)
- `seed.js` — Resets and repopulates MongoDB
- `.env` — Mongo connection string
- `SETUP.md` — This file
