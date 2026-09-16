# TrizenAI Photo Sharing Platform

A full-stack event photo-sharing platform developed for the TrizenAI Full Stack Internship Challenge.

The platform allows Admins to create events and manage team members, Team Members to upload event photos, and Customers to access published galleries using a Gallery Code and PIN.

---

## Live Application

### Frontend - Vercel

https://trizenai-photo-sharing-hzf2.vercel.app

### Backend API - Render

https://trizenai-photo-sharing-1omx.onrender.com

### GitHub Repository

https://github.com/huzaif789/trizenai-photo-sharing

---

## Features

### Admin

- Register and login
- Create events
- Create Team Member accounts
- Assign Team Members to events
- View all photos uploaded for an event
- Upload multiple photos
- Review event photos
- Select final photos for the customer gallery
- Publish a gallery
- Generate a Gallery Code and PIN
- Manage the complete event photo workflow

### Team Member

- Login using an account created by Admin
- View assigned events
- Upload multiple photos to assigned events
- View their uploaded photos
- Restricted from Admin-only operations
- Cannot publish galleries

### Customer

- No account required
- No registration required
- Open the Customer Gallery
- Enter Gallery Code
- Enter Gallery PIN
- View selected and published event photos

---

## Application Workflow

1. Admin registers and logs in.
2. Admin creates a Team Member account.
3. Admin creates an event.
4. Admin assigns the Team Member to the event.
5. Team Member logs in.
6. Team Member views the assigned event.
7. Team Member uploads event photos.
8. Admin reviews all event photos.
9. Admin selects the final photos.
10. Admin publishes the Customer Gallery.
11. The application generates a Gallery Code and PIN.
12. Customer opens the Customer Gallery.
13. Customer enters the Gallery Code and PIN.
14. Customer views the selected published photos.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Fetch API
- Vercel

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- Multer
- Cloudinary
- Render

### Database

MongoDB Atlas is used to store application data and photo metadata.

### Image Storage

Cloudinary is used for cloud-based image storage.

Uploaded images are stored in Cloudinary while MongoDB stores the corresponding photo metadata and storage location.

---

## System Architecture

```text
       Admin / Team Member / Customer
                    |
                    v
             React + Vite
                Frontend
               (Vercel)
                    |
                    |
              HTTPS REST API
                    |
                    v
          Node.js + Express.js
                 Backend
                (Render)
               /        \
              /          \
             v            v
      MongoDB Atlas    Cloudinary
         Database      Image Storage
```

### Architecture Explanation

The React frontend handles the user interface for Admins, Team Members, and Customers.

The frontend communicates with the Express backend through REST API requests.

The backend handles:

- Authentication
- Authorization
- Event management
- Team Member management
- Photo metadata
- Gallery publishing
- Gallery PIN verification

MongoDB Atlas stores application data.

Cloudinary stores uploaded image files.

---

## Database Models

### User

Stores user account information.

Main fields include:

- Username
- Email
- Hashed password
- Role

Available roles:

```text
Admin
Team Member
```

---

### Event

Stores information about photography events.

Main fields include:

- Event name
- Description
- Event date
- Admin who created the event
- Assigned Team Members
- Event status

---

### Photo

Stores information about uploaded event photos.

Main fields include:

- Event reference
- Uploaded-by user
- File information
- Cloud storage location
- MIME type
- File size
- Selection status

The actual image is stored in Cloudinary.

---

### Gallery

Stores published customer gallery information.

Main fields include:

- Event reference
- Admin reference
- Unique Gallery Code
- Hashed Gallery PIN
- Publication status
- Publication date

Only selected photos are returned through the customer gallery workflow.

---

## Authentication

The application uses JSON Web Tokens (JWT) for authentication.

After successful login, the backend generates a JWT.

Protected API requests use:

```text
Authorization: Bearer <token>
```

The backend validates the token before allowing access to protected resources.

---

## Role-Based Authorization

The application contains two authenticated roles:

```text
Admin
Team Member
```

### Admin Permissions

Admins can:

- Create events
- Create Team Members
- Assign Team Members
- View event photos
- Select photos
- Publish galleries

### Team Member Permissions

Team Members can:

- View assigned events
- Upload photos to assigned events
- View their uploaded photos

Team Members cannot perform Admin-only operations such as publishing galleries.

### Customer Access

Customers do not need accounts.

Customer gallery access is handled using:

```text
Gallery Code + PIN
```

---

## Password and PIN Security

User passwords are hashed using bcrypt before being stored in MongoDB.

Gallery PINs are also hashed.

Plain-text passwords and plain-text Gallery PINs are not stored in the database.

---

## Photo Upload

The application supports multiple photo uploads.

Supported image formats include:

- JPG
- JPEG
- PNG
- WebP

The backend validates uploads and controls the maximum file size.

Images are uploaded to Cloudinary.

MongoDB stores the image metadata and Cloudinary storage location.

---

## API Structure

Main API routes include:

```text
/api/auth
/api/users
/api/events
/api/photos
/api/galleries
```

### Authentication API

Used for:

```text
Admin registration
Admin login
Team Member login
```

### User API

Used for:

```text
Create Team Member
View Team Members
```

### Event API

Used for:

```text
Create Event
View Events
Assign Team Members
```

### Photo API

Used for:

```text
Upload Photos
View Event Photos
Select Photos
```

### Gallery API

Used for:

```text
Publish Gallery
Unlock Customer Gallery
Verify Gallery PIN
```

---

## Local Development

### Requirements

Install the following software:

- Node.js
- npm
- Git

You also need:

- MongoDB Atlas database
- Cloudinary account

---

## Clone Repository

```powershell
git clone https://github.com/huzaif789/trizenai-photo-sharing.git
cd trizenai-photo-sharing
```

---

## Backend Setup

Open the project in VS Code.

Open a terminal and run:

```powershell
cd backend
npm install
```

Create the backend environment file:

```powershell
Copy-Item .env.example .env
```

Configure:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:5173
```

Do not commit real environment-variable values to GitHub.

Start the backend:

```powershell
npm run dev
```

The local backend will run at:

```text
http://localhost:5000
```

---

## Frontend Setup

Open another VS Code terminal.

Run:

```powershell
cd frontend
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Configure:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Automated Testing

The backend contains automated tests using:

- Jest
- Supertest
- MongoDB Memory Server

Run the tests using:

```powershell
cd backend
npm test
```

### Verified Test Results

The complete backend automated test suite was executed successfully.

```text
PASS tests/auth.test.js
PASS tests/gallery.test.js
PASS tests/roles.test.js

Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Snapshots:   0 total
```

All 20 automated tests passed.

### Test Areas

The automated tests cover important functionality including:

- Admin registration
- Admin login
- Invalid login handling
- JWT authentication
- Protected routes
- Admin event creation
- Role-based authorization
- Team Member permissions
- Team Member event access
- Gallery publishing
- Gallery access
- Gallery PIN validation

---

## Production Deployment

The complete application is deployed online.

### Frontend Deployment

Platform:

```text
Vercel
```

Live URL:

```text
https://trizenai-photo-sharing-hzf2.vercel.app
```

Production frontend environment variable:

```env
VITE_API_URL=https://trizenai-photo-sharing-1omx.onrender.com
```

---

### Backend Deployment

Platform:

```text
Render
```

Backend API:

```text
https://trizenai-photo-sharing-1omx.onrender.com
```

Production backend environment variables include:

```text
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FRONTEND_URL
```

Actual secret values are configured directly on Render and are not stored in the GitHub repository.

---

### Database Deployment

MongoDB Atlas is used as the production database.

MongoDB stores:

- Users
- Events
- Photo metadata
- Gallery information

---

### Image Storage

Cloudinary provides cloud image storage.

Uploaded photos are stored in Cloudinary instead of directly inside MongoDB.

---

## Security

The project implements several security controls:

- bcrypt password hashing
- Hashed Gallery PINs
- JWT authentication
- Role-based authorization
- Protected backend API routes
- Event access control
- Upload validation
- Environment-variable based configuration
- CORS configuration
- MongoDB authentication
- Gallery PIN verification

---

## Environment Variable Security

Never commit sensitive values such as:

```text
MongoDB passwords
MongoDB connection strings containing credentials
JWT secrets
Cloudinary API secrets
.env files
```

Environment files should remain excluded from Git using `.gitignore`.

Example:

```gitignore
.env
backend/.env
frontend/.env
node_modules/
```

---

## Demo Workflow

The application can be demonstrated using the following workflow:

```text
                 ADMIN
                   |
                   v
           Register / Login
                   |
                   v
         Create Team Member
                   |
                   v
             Create Event
                   |
                   v
         Assign Team Member
                   |
                   v
              TEAM MEMBER
                   |
                   v
                 Login
                   |
                   v
         View Assigned Event
                   |
                   v
          Upload Event Photos
                   |
                   v
                 ADMIN
                   |
                   v
          Review All Photos
                   |
                   v
        Select Final Photos
                   |
                   v
          Publish Gallery
                   |
                   v
       Gallery Code + PIN
                   |
                   v
               CUSTOMER
                   |
                   v
      Enter Gallery Code + PIN
                   |
                   v
        View Published Photos
```

---

## Demo Credentials

For security, real personal credentials should not be stored in this README.

For internship evaluation, provide dedicated demo credentials separately in the submission form.

Example:

```text
Admin Demo

Email: <demo-admin-email>
Password: <demo-admin-password>


Team Member Demo

Email: <demo-team-email>
Password: <demo-team-password>


Customer Demo

Gallery Code: <demo-gallery-code>
PIN: <demo-gallery-pin>
```

Replace the placeholders with dedicated demo credentials when providing them privately to the evaluator.

---

## Deployment Status

```text
Frontend        : Deployed - Vercel
Backend         : Deployed - Render
Database        : Deployed - MongoDB Atlas
Image Storage   : Cloudinary
Automated Tests : 20/20 Passing
```

---

## Current Limitations

- The backend is hosted using Render's free hosting tier, so the first request after a period of inactivity may take additional time while the service starts.
- Cloudinary is used for image hosting. Customer gallery access is protected by the application's Gallery Code and PIN workflow, but an underlying Cloudinary image URL may be directly accessible if someone already knows that URL.
- Each event currently supports a single published gallery.
- The project is an internship challenge implementation and is not intended to represent a production-scale commercial photography platform.

---

## Future Improvements

Possible future improvements include:

- Private object storage with signed image URLs
- Gallery expiration dates
- Download controls
- Photo search and filtering
- Admin analytics dashboard
- Email gallery invitations
- Image thumbnails and optimization
- Improved event management
- Gallery update and republishing support

---

## Project Structure

```text
trizenai-photo-sharing/
|
|-- backend/
|   |-- config/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- tests/
|   |-- app.js
|   |-- server.js
|   |-- package.json
|
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- package.json
|   |-- vite.config.js
|
|-- README.md
|-- .gitignore
```

---

## Author

**Syed Huzaifa Rahimuddin**

B.Tech Information Technology

GitHub:

https://github.com/huzaif789

---

## Project

TrizenAI Full Stack Internship Challenge

Full-Stack Event Photo Sharing and Customer Gallery Platform