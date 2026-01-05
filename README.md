# 🌿 BlendWise

A full-stack web application for discovering, creating, and managing essential oil blends. Built with Django REST Framework and React + Vite.

![Python](https://img.shields.io/badge/python-3.10+-blue)
![React](https://img.shields.io/badge/react-18-61DAFB)

## ✨ Features

### 🧴 Essential Oils Catalog
- Browse a comprehensive catalog of essential oils
- View detailed oil profiles including notes (top/middle/base), aromas, and vibes
- Search and filter oils by properties
- Add oils to your **Wishlist** or mark as **Owned**

### 🧪 Blend Creation
- Create custom blends with multiple oils
- Specify drops and note type for each ingredient
- Real-time blend analysis:
  - Note balance pyramid (top/middle/base percentages)
  - Aroma family distribution
  - Vibe composition
  - Complexity score
  - Smart suggestions for blend improvement
- Save blends as public or private

### ❤️ Favorites & Collections
- Save favorite blends from the community
- Manage your personal blend collection
- Edit and delete your own blends

### 👤 User Authentication
- Register and login with secure token-based authentication
- Personalized experience with saved preferences

## 🛠️ Tech Stack

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (easily swappable to PostgreSQL)
- **Token Authentication** - Secure API access

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BlendWise
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Seed the database with essential oils**
   ```bash
   python manage.py seed_oils
   python manage.py seed_user  # Creates a test user
   ```

6. **Start the Django server**
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000/api/`

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend/vite-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5175/`

## 📁 Project Structure

```
BlendWise/
├── api/                          # Django app
│   ├── models.py                 # Database models
│   ├── views.py                  # API views
│   ├── serializers.py            # DRF serializers
│   ├── urls.py                   # API routes
│   ├── permissions.py            # Custom permissions
│   └── management/commands/      # Management commands
│       ├── seed_oils.py          # Seed essential oils data
│       └── seed_user.py          # Create test user
├── backend/                      # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── requirements.txt
├── frontend/
│   └── vite-project/             # React frontend
│       ├── src/
│       │   ├── Components/
│       │   │   ├── Auth/         # Login/Register
│       │   │   ├── Common/       # Reusable components
│       │   │   ├── Layout/       # App layout
│       │   │   ├── Pages/        # Page components
│       │   │   └── ui/           # UI primitives
│       │   ├── api/
│       │   │   └── client.ts     # API client
│       │   └── App.tsx           # Main app component
│       └── package.json
├── manage.py                     # Django management script
├── db.sqlite3                    # SQLite database
└── venv/                         # Python virtual environment
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register new user |
| POST | `/api/login/` | Login and get token |

### Essential Oils
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/essential-oils/` | List all oils |
| GET | `/api/essential-oils/:id/` | Get oil details |
| GET | `/api/notes/` | List note types |
| GET | `/api/aromas/` | List aroma families |
| GET | `/api/vibes/` | List vibes |

### User Collections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/oil-relations/wishlist/` | Get wishlist |
| GET | `/api/oil-relations/owned/` | Get owned oils |
| POST | `/api/oil-relations/` | Add to collection |
| DELETE | `/api/oil-relations/:id/` | Remove from collection |

### Blends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blends/` | List public blends |
| GET | `/api/blends/mine/` | List user's blends |
| POST | `/api/blends/` | Create blend |
| PUT | `/api/blends/:id/` | Update blend |
| DELETE | `/api/blends/:id/` | Delete blend |

### Blend Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blend-favorites/` | List favorite blends |
| POST | `/api/blend-favorites/` | Add to favorites |
| DELETE | `/api/blend-favorites/by-blend/?blend_id=:id` | Remove from favorites |

## 🎨 Screenshots

*Coming soon*

## 🙏 Acknowledgments

- Essential oil data sourced from aromatherapy references
- Icons by [Lucide](https://lucide.dev/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
