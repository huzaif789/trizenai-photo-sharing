# TrizenAI Photo Sharing Platform

A full-stack event photo-sharing platform developed for the TrizenAI Full Stack Internship Challenge.

The platform allows Admins to create events and manage team members, Team Members to upload event photos, and Customers to access published galleries using a secure Gallery Code and PIN.

## Live Application

### Frontend - Vercel

https://trizenai-photo-sharing-hzf2.vercel.app

### Backend API - Render

https://trizenai-photo-sharing-1omx.onrender.com

### GitHub Repository

https://github.com/huzaif789/trizenai-photo-sharing


## Features

### Admin

- Register and login
- Create events
- Create Team Member accounts
- Assign Team Members to events
- View photos uploaded for an event
- Upload multiple photos
- Select photos for the customer gallery
- Publish a gallery
- Generate a Gallery Code and PIN
- Manage event photo workflow


### Team Member

- Login using an account created by Admin
- View assigned events
- Upload multiple photos to assigned events
- View their uploaded photos
- Restricted from Admin-only operations


### Customer

- No account or login required
- Open the Customer Gallery
- Enter Gallery Code
- Enter Gallery PIN
- View selected and published event photos


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
12. Customer enters the Gallery Code and PIN.
13. Customer views the published photos.


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
- JWT Authentication
- bcryptjs
- Multer
- Cloudinary
- Render

### Database

MongoDB Atlas is used to store application data and metadata.

### Image Storage

Cloudinary is used for cloud-based image storage.

Images are uploaded to Cloudinary while MongoDB stores the corresponding photo metadata and storage location.


## Architecture

```text
Customer / Admin / Team Member
              |
              v
       React + Vite
        (Vercel)
              |
              | HTTPS REST API
              v
     Node.js + Express
         (Render)
          /       \
         /         \
        v           v
 MongoDB Atlas   Cloudinary
 Database        Image Storage
```


## Database Models

### User

Stores:

- Username
- Email
- Hashed password
- Role: Admin or Team Member


### Event

Stores:

- Event name
- Description
- Event date
- Admin who created the event
- Assigned Team Members
- Event status


### Photo

Stores:

- Event reference
- Uploaded-by user
- File information
- Cloud storage location
- MIME type
- File size
- Selection status


### Gallery

Stores:

- Event reference
- Admin reference
- Unique Gallery Code
- Hashed Gallery PIN
- Publication status
- Publication date


## Authentication and Authorization

The application uses JSON Web Tokens (JWT) for authentication.

Protected API routes require:

```text
Authorization: Bearer <token>
```

Role-based authorization separates Admin and Team Member permissions.

Passwords are hashed before being stored in MongoDB.

Gallery PINs are also stored as hashes rather than plain-text PINs.


## Photo Upload

The application supports multiple image uploads.

Supported image formats include:

- JPG
- JPEG
- PNG
- WebP

Maximum upload size is controlled by the backend upload configuration.

Images are stored using Cloudinary.


## Local Development

### Requirements

Install:

- Node.js
- npm
- Git

You also need:

- MongoDB Atlas database
- Cloudinary account


## Backend Setup

Open a terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Configure the following environment variables in:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

Then start the backend:

```powershell
npm run dev
```

Backend runs locally at:

```text
http://localhost:5000
```


## Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Configure:

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


## Production Deployment

### Frontend

The React frontend is deployed using Vercel.

Production environment variable:

```env
VITE_API_URL=https://trizenai-photo-sharing-1omx.onrender.com
```


### Backend

The Node.js/Express backend is deployed using Render.

Production environment variables include:

```text
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FRONTEND_URL
```

Secret values are configured directly in the deployment platform and are not committed to GitHub.


## Testing

Backend automated tests use:

- Jest
- Supertest
- MongoDB Memory Server

Run tests from the backend directory:

```powershell
cd backend
npm test
```

The test suite covers important authentication and authorization behavior such as:

- Admin registration
- Admin login
- Invalid login handling
- Protected route authentication
- Admin event creation
- Role-based access restrictions
- Team Member event access


## Security

The project implements:

- Password hashing using bcrypt
- Hashed Gallery PINs
- JWT authentication
- Role-based authorization
- Protected API routes
- Event access control
- Upload file validation
- Environment-variable based secrets
- MongoDB network access configuration
- CORS configuration


## Environment Variable Security

Never commit the following values to GitHub:

```text
MongoDB passwords
MongoDB connection strings containing credentials
JWT secrets
Cloudinary API secrets
.env files
```

The `.env` file should remain excluded using `.gitignore`.


## Demo Workflow

For evaluation, the application can be tested using the following flow:

```text
Admin
  |
  +-- Create Team Member
  |
  +-- Create Event
  |
  +-- Assign Team Member
  |
  v
Team Member
  |
  +-- Login
  |
  +-- Open Assigned Event
  |
  +-- Upload Photos
  |
  v
Admin
  |
  +-- Review Photos
  |
  +-- Select Photos
  |
  +-- Publish Gallery
  |
  v
Customer
  |
  +-- Enter Gallery Code
  |
  +-- Enter PIN
  |
  v
Published Gallery
```


## Deployment Status

Frontend: Deployed on Vercel

Backend: Deployed on Render

Database: MongoDB Atlas

Image Storage: Cloudinary


## Author

Syed Huzaifa Rahimuddin

B.Tech Information Technology

GitHub: https://github.com/huzaif789