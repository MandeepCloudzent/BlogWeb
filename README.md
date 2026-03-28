# BlogVerse ✦

A modern, full-stack blogging platform built with **Django (Django Rest Framework)** and **React (Vite)**. It empowers writers, thinkers, and creators to share their stories with the world through a premium, responsive, and delightful user experience.

---

## 🚀 Features

### Frontend (React + Vite)
- **Modern UI/UX**: Premium design with glassmorphism, gradient text, and micro-animations.
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop devices.
- **Dark/Light Mode**: Built-in theme toggler using Context API.
- **Rich User Profiles**: 
  - Social media-style hero sections with stats (Total Posts, Joined Date).
  - Interactive Avatar System (Fullscreen lightbox view & click-to-upload feature).
  - Edit Profile & Change Password forms.
- **Content Discovery**: 
  - Full-text search and category/tag filtering.
  - "Read Time" estimations for articles.
- **Protected Routes**: Secure navigation and role-based access control (User vs. Admin).
- **Admin Dashboard**: Overview of platform statistics (Total Users, Published Posts, Comments) and message moderation.

### Backend (Django + DRF)
- **Robust Authentication**: Secure JWT-based authentication (Access & Refresh tokens).
- **Relational Architecture**:
  - `accounts`: Custom User models, automated Profile creation via Django Signals.
  - `blog`: Posts, threaded Comments, Categories, and Tags.
  - `contact`: Secure messaging integration.
- **Advanced Querying**: PostgreSQL full-text search (`SearchVector`).
- **RESTful API**: Centralized and documented API endpoints with proper serialization.
- **Environment Management**: Split settings (`base`, `development`, `production`) mapped via `.env`.

---

## 🛠️ Technology Stack

**Frontend:**
- React 18 (Vite)
- React Router DOM v6
- Axios (with Interceptors for JWT auth)
- React Hot Toast (Notifications)
- React Icons
- Vanilla CSS (Custom Design System)

**Backend:**
- Python 3.12, Django 5.x
- Django Rest Framework (DRF)
- djangorestframework-simplejwt
- PostgreSQL (Production-ready) / SQLite (Local dev)
- django-cors-headers

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
# Copy .env.example to .env and fill in the required keys

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser (admin)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```
*The API will be available at `http://localhost:8000/api/`*

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup Environment Variables
# Copy .env.example to .env and ensure VITE_API_URL is set

# Start the development server
npm run dev
```
*The React app will be available at `http://localhost:5173/`*

---

## 📚 Core API Endpoints

### Authentication `/api/auth/`
- `POST /register/` - Register a new account
- `POST /login/` - Obtain JWT access & refresh tokens
- `POST /token/refresh/` - Refresh JWT access token
- `GET /me/` - Retrieve current user profile
- `PATCH /me/` - Update profile (includes multipart avatar uploads)
- `POST /password/change/` - Secure password change

### Blog `/api/blog/`
- `GET /posts/` - List all posts (supports search/filter)
- `GET /posts/<slug>/` - Retrieve full article
- `POST /posts/` - Create a new post
- `GET /categories/` - List all categories

### Admin `/api/auth/admin/stats/`
- `GET /` - Retrieve high-level platform statistics

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
