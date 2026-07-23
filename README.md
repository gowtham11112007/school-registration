# School Registration Website

A full-stack school registration system with student registration form, admin dashboard, and email notifications.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python Flask
- **Database**: MongoDB (pymongo)
- **Email**: SMTP via Gmail
- **Deployment**: Render.com (single platform for both frontend & backend)

## Project Structure

```
.
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration and environment variables
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── routes/
│   │   ├── __init__.py
│   │   └── registrations.py   # API endpoints
│   ├── models/
│   │   └── student.py         # Student data model
│   └── utils/
│       ├── email_sender.py    # Email functionality
│       └── validators.py     # Input validation
├── frontend/
│   ├── index.html             # Home page
│   ├── register.html          # Registration form
│   ├── admin.html             # Admin dashboard
│   ├── css/
│   │   └── style.css          # Responsive styles
│   └── js/
│       ├── register.js        # Form validation and API calls
│       └── admin.js           # Admin dashboard logic
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.8 or higher
- MongoDB (local or cloud instance)
- Gmail account with App Password for SMTP

## Setup Instructions

### 1. Clone the Repository

```bash
cd /path/to/project
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
```

Required environment variables in `.env`:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/

# SMTP Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_APP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@school.com

# Flask Configuration
SECRET_KEY=your-secret-key-here
DEBUG=False

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Important**: To get a Gmail App Password:
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Go to Security > App Passwords
4. Generate a new app password for "Mail"
5. Use this password in `SMTP_APP_PASSWORD`

### 4. Start MongoDB

If using local MongoDB:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

Or use MongoDB Atlas (cloud) and update `MONGO_URI` accordingly.

### 5. Run the Backend

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python app.py
```

The Flask API will run on `http://localhost:5000`

### 6. Run the Frontend

Since the frontend is static HTML/CSS/JS, you can serve it using any static file server:

**Option 1: Python Simple Server**
```bash
cd frontend
python3 -m http.server 3000
```

**Option 2: Node.js http-server**
```bash
cd frontend
npx http-server -p 3000
```

**Option 3: VS Code Live Server Extension**
- Install "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

The frontend will be available at `http://localhost:3000`

## Usage

### Student Registration

1. Navigate to `http://localhost:3000`
2. Click "Register Now"
3. Fill out the registration form with student and parent information
4. Submit the form
5. Receive confirmation with Registration ID
6. Confirmation email will be sent to the parent's email

### Admin Dashboard

1. Navigate to `http://localhost:3000/admin.html`
2. Enter the admin key (use the `SECRET_KEY` from your `.env` file)
3. View all registrations in a table
4. Search/filter by name or class
5. View detailed registration information
6. Update status (Approved/Rejected/Pending)
7. Delete registrations

## API Endpoints

### POST /api/register
Register a new student.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "date_of_birth": "2015-05-15",
  "gender": "male",
  "class_grade": "5",
  "parent_name": "Jane Doe",
  "parent_contact": "1234567890",
  "email": "parent@example.com",
  "address": "123 Main St",
  "previous_school": "Old School",
  "photo_url": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "registration_id": "REG2024ABC12345"
}
```

### GET /api/registrations
Get all registrations (admin-only).

**Headers:**
```
Authorization: Bearer {SECRET_KEY}
```

**Query Parameters:**
- `search`: Search by name or class
- `status`: Filter by status (pending, approved, rejected)

### GET /api/registrations/<registration_id>
Get a single registration by ID.

### DELETE /api/registrations/<registration_id>
Delete a registration (admin-only).

### PUT /api/registrations/<registration_id>/status
Update registration status (admin-only).

**Request Body:**
```json
{
  "status": "approved"
}
```

## Features

### Frontend
- Responsive design (mobile-friendly)
- Client-side form validation
- Real-time error feedback
- Clean, modern UI
- Admin dashboard with search/filter
- Status management (Pending/Approved/Rejected)

### Backend
- RESTful API design
- Input validation and sanitization
- XSS protection
- Email notifications via SMTP
- MongoDB integration
- CORS support
- Environment-based configuration

### Security
- All credentials loaded from environment variables
- Input sanitization to prevent XSS
- Basic admin authentication
- .gitignore to prevent committing secrets

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify MongoDB credentials

### Email Not Sending
- Verify Gmail App Password is correct
- Check `SMTP_EMAIL` and `SMTP_APP_PASSWORD` in `.env`
- Ensure 2-factor authentication is enabled on Gmail
- Check firewall/network settings

### CORS Errors
- Update `CORS_ORIGINS` in `.env` with your frontend URL
- Ensure frontend and backend URLs match

### Admin Login Issues
- Use the `SECRET_KEY` from your `.env` file as the admin key
- Ensure the key is entered correctly

## Deployment to Render.com

### Quick Deploy (Single Platform for Frontend + Backend)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/school-registration.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file
   - Click "Deploy Web Service"

3. **Configure Environment Variables**
   In Render dashboard, add these environment variables for the backend service:
   - `MONGO_URI` - Your MongoDB connection string (use MongoDB Atlas for cloud)
   - `SMTP_EMAIL` - Your Gmail address
   - `SMTP_APP_PASSWORD` - Your Gmail app password
   - `ADMIN_EMAIL` - Admin email for notifications
   - `SECRET_KEY` - Secret key for admin authentication

4. **Update Frontend Config**
   After deployment, update `frontend/config.js` with your backend URL:
   ```javascript
   window.API_URL = 'https://your-backend-url.onrender.com';
   ```
   Then push and redeploy.

## Development

To run in development mode with debug enabled:
```env
DEBUG=True
```

Then restart the Flask server.

## License

This project is provided as-is for educational purposes.
