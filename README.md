# TrizenAI Photo Sharing Platform

Complete full-stack starter for the internship challenge.

## Features
- Admin registration/login
- Admin creates Team Member accounts
- Admin creates events and assigns team members
- Team members see assigned events
- Multiple event photo upload
- Admin sees all event photos and selects final photos
- Admin publishes a PIN-protected gallery
- Customer opens gallery without an account using gallery code + PIN
- JWT role authorization and hashed passwords/PINs

## Run in VS Code

### Backend
```powershell
cd backend
npm install
Copy-Item .env.example .env
```
Edit `.env` and set your real MongoDB Atlas `MONGO_URI` and a long random `JWT_SECRET`.

Then:
```powershell
npm run dev
```

### Frontend
Open a second terminal:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open `http://localhost:5173`.

## Important for final submission
This version uses local `backend/uploads` storage so it runs immediately. The internship specification asks for cloud/object storage. Before final deployment, switch the upload layer to AWS S3, Azure Blob, GCS, or equivalent. Do not commit `.env`.

