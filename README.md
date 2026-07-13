# Portal Sespim Lemdiklat Polri - REST Backend API

Backend REST API for **Portal Resmi Sespim Lemdiklat Polri**, built using Node.js, Express, and MySQL/MariaDB. It supports user management, secure JWT authentication, and full CRUD operations for all 10 content tables.

## Technology Stack

- **Node.js** (v18+)
- **Express.js** (REST API routing and controllers)
- **MySQL2** (Promise-based Connection Pool)
- **JSON Web Tokens (JWT)** (Stateless Session Authentication)
- **bcryptjs** (Password Hashing)
- **CORS & Morgan** (Development middleware)

---

## 1. Setup & Installation

### Step 1: Install Dependencies
Clone the repository, enter the root directory, and run:
```bash
npm install
```

### Step 2: Set Up Environment Variables
Copy the template `.env.example` to `.env` and fill in your local MySQL details:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portalsespim
JWT_SECRET=portalsespim_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
```

### Step 3: Initialize Database
Import the schema and initial seed data in `Database/portalsespimpolri.sql` to your local MariaDB/MySQL server.
Using terminal command:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS portalsespim;"
mysql -u root -p portalsespim < Database/portalsespimpolri.sql
```
*(If you do not have a root password, omit the `-p` parameter)*

### Step 4: Run the Server
For development with hot reload:
```bash
npm run dev
```
For production:
```bash
npm start
```

---

## 2. API Endpoint documentation

### Authentication & Self Info
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | None | `{ "identifier": "nrp_nip_or_phone", "password": "..." }` | Login and obtain JWT token |
| `POST` | `/api/auth/register` | None | `{ "name", "nrp_nip", "phone", "password", "role", "role_label" }` | Register a new user |
| `GET` | `/api/auth/me` | JWT | None | Get info of the currently logged-in user |

### User Management (CRUD)
| Method | Endpoint | Auth | Required Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | JWT | `super_admin`, `admin`, `stakeholder` | Get list of all users |
| `GET` | `/api/users/:id` | JWT | `super_admin`, `admin`, `stakeholder` | Get a specific user by ID |
| `POST` | `/api/users` | JWT | `super_admin` | Create a new user |
| `PUT` | `/api/users/:id` | JWT | `super_admin` | Update user details by ID |
| `DELETE` | `/api/users/:id` | JWT | `super_admin` | Delete user by ID |

### Content Management (Dynamic CRUD)
Available content endpoints (substitute `:contentType` parameter):
- `beranda-content`
- `profil-content`
- `program-pendidikan-content`
- `kelembagaan-internal-content`
- `widyaiswara-content`
- `publikasi-content`
- `berita-informasi-content`
- `galeri-unduhan-content`
- `kontak-content`
- `sarana-prasarana-content`

| Method | Endpoint | Auth | Required Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/:contentType` | None | Public | Get list of content (supports pagination, search, status, category filter) |
| `GET` | `/api/:contentType/:id` | None | Public | Get specific content record by ID |
| `POST` | `/api/:contentType` | JWT | `super_admin`, `admin` | Create new content record |
| `PUT` | `/api/:contentType/:id` | JWT | `super_admin`, `admin` | Update content record by ID |
| `DELETE` | `/api/:contentType/:id` | JWT | `super_admin`, `admin` | Delete content record by ID |

---

## 3. Query Parameter Utilities for Content Listing

You can apply the following query parameters when requesting lists:
- `search`: Search query string matching fields like `title` or `author`.
- `category`: Filter content by exact category (e.g. `category=Sambutan`).
- `status`: Filter content by status (`status=Published` or `status=Draft`).
- `page`: Page index (default: `1`).
- `limit`: Number of items per page (default: `10`).

Example:
```
GET /api/berita-informasi-content?status=Published&search=Kapolri&page=1&limit=5
```

---

## 4. Testing Endpoints via CURL

### Login with default user
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "197204151996031001", "password": "polri123"}'
```

### Retrieve Content List (Public)
```bash
curl http://localhost:5000/api/beranda-content
```

### Create Content Record (Requires JWT Auth Header)
```bash
curl -X POST http://localhost:5000/api/beranda-content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Pengumuman Baru", "category": "Headline", "date": "2026-07-09", "status": "Published"}'
```
*(If `id` is omitted, the API automatically generates it, e.g. `h-3` based on existing IDs)*
