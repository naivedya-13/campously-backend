# Campously Backend

A campus e-commerce API built with **Node.js**, **Express**, and **Prisma** (MySQL). College students can browse products, use a cart and wishlist, while **admin** students (sellers) can list and manage products on campus.

---

## What this project does

| Role | Who is it? | What can they do? |
|------|------------|-------------------|
| **ADMIN** | Student who sells items on campus | Register/login, create products, edit/delete **their own** products |
| **STUDENT** | Regular buyer on campus | Register/login, browse products, add to **cart** and **wishlist** |

> **Important:** Admin and student use **different** login URLs. A student token cannot create products. An admin token cannot use the student cart/wishlist routes (those expect `STUDENT` role).

---

## Tech stack

- **Node.js** + **Express** — REST API server  
- **Prisma** — talks to MySQL database  
- **MySQL** — stores users, products, cart, wishlist, orders  
- **JWT** — login tokens (send in `Authorization` header)  
- **bcryptjs** — passwords are hashed (never stored as plain text)

---

## Project folder structure

```
campously-backend/
├── server.js                 # Starts the server
├── package.json
├── prisma/
│   └── schema.prisma         # Database models (User, Product, Cart, etc.)
└── src/
    ├── app.js                # Express app + route mounting
    ├── config/
    │   └── prisma.js         # Prisma client
    ├── middleware/
    │   ├── authMiddleware.js # Checks JWT (logged-in user)
    │   └── adminMiddleware.js# Checks JWT + ADMIN role
    └── modules/
        ├── admin/            # Seller APIs
        │   ├── index.js
        │   ├── auth/         # index.js → routes, controller.js → logic, helper.js → DB
        │   └── product/
        └── public/           # Buyer APIs
            ├── index.js
            ├── auth/
            ├── product/
            ├── cart/
            └── wishlist/
```

Each feature folder has **3 files**:

| File | Purpose |
|------|---------|
| `index.js` | Defines URLs (router) |
| `controller.js` | Reads request, sends response |
| `helper.js` | Database queries (Prisma) |

---

## Prerequisites

Install these before you start:

1. [Node.js](https://nodejs.org/) (v18 or newer recommended)  
2. [MySQL](https://dev.mysql.com/downloads/) (local or XAMPP/WAMP)  
3. [Git](https://git-scm.com/) (optional, for cloning)  
4. **Postman** or **Thunder Client** (VS Code) — to test APIs

---

## Setup (step by step)

### 1. Clone and install packages

```bash
git clone <your-repo-url>
cd campously-backend
npm install
```

### 2. Create MySQL database

In MySQL (phpMyAdmin or command line), create a database, for example:

```sql
CREATE DATABASE campously;
```

### 3. Create `.env` file

In the project root, create a file named `.env`:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/campously"
JWT_SECRET="your_super_secret_key_change_this"
PORT=5000
```

| Variable | Meaning |
|----------|---------|
| `DATABASE_URL` | MySQL connection string (`user:password@host:port/database`) |
| `JWT_SECRET` | Secret key used to sign login tokens — use a long random string |
| `PORT` | Server port (default `5000` if omitted) |

### 4. Push schema to database (no migrations)

This syncs tables from `prisma/schema.prisma` directly to MySQL — good for learning and local dev:

```bash
npx prisma db push
```

Generate Prisma client (first time or after schema changes):

```bash
npx prisma generate
```

### 5. Seed demo data

Fills the database with sample admin, students, products, cart, and wishlist:

```bash
npm run seed
```

**Demo accounts** (all use password `password123`):

| Email | Role |
|-------|------|
| `admin@campously.edu` | ADMIN (seller) |
| `student1@campously.edu` | STUDENT |
| `student2@campously.edu` | STUDENT |

> Running seed again **clears** existing data and re-inserts demo rows.

**Quick setup (after `.env` is ready):**

```bash
npx prisma db push
npm run seed
```

### 6. Start the server

```bash
npm start
```

You should see:

```text
Server is running on port 5000 🚀
```

Base URL for all APIs:

```text
http://localhost:5000
```

---

## How authentication works (JWT)

1. User calls **login** or **register**.  
2. Server returns a **token** string.  
3. For protected routes, send the token in the header:

```http
Authorization: Bearer <paste_your_token_here>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Without a valid token → `401` or `403` error.

---

## Recommended flow (for learning)

Follow this order when testing with Postman:

```mermaid
flowchart TD
    A[1. Admin Register] --> B[2. Admin Login - save token]
    B --> C[3. Admin Create Product]
    C --> D[4. Student Register]
    D --> E[5. Student Login - save token]
    E --> F[6. Browse Products - no token]
    F --> G[7. Add to Wishlist]
    G --> H[8. Add to Cart]
    H --> I[9. View Cart / Update quantity]
```

### Step-by-step summary

| Step | Who | Action |
|------|-----|--------|
| 1 | Admin | `POST /api/admin/auth/register` |
| 2 | Admin | `POST /api/admin/auth/login` → copy `token` |
| 3 | Admin | `POST /api/admin/products` with admin token → note `product.id` |
| 4 | Student | `POST /api/auth/register` |
| 5 | Student | `POST /api/auth/login` → copy `token` |
| 6 | Anyone | `GET /api/products` (no token) |
| 7 | Student | `POST /api/wishlist` with student token |
| 8 | Student | `POST /api/cart` with student token |
| 9 | Student | `GET /api/cart` with student token |

---

# API Reference

All request bodies use **JSON**. Set header:

```http
Content-Type: application/json
```

---

## Admin APIs (seller)

Base path: `/api/admin`

### Auth

#### Register admin (seller)

```http
POST /api/admin/auth/register
```

**Body:**

```json
{
  "name": "Rahul Seller",
  "email": "rahul.admin@college.edu",
  "password": "password123"
}
```

**Success (201):**

```json
{
  "message": "Admin registered successfully.",
  "user": {
    "id": 1,
    "name": "Rahul Seller",
    "email": "rahul.admin@college.edu",
    "role": "ADMIN"
  }
}
```

---

#### Admin login

```http
POST /api/admin/auth/login
```

**Body:**

```json
{
  "email": "rahul.admin@college.edu",
  "password": "password123"
}
```

**Success (200):**

```json
{
  "message": "Admin login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Rahul Seller",
    "email": "rahul.admin@college.edu",
    "role": "ADMIN"
  }
}
```

Save the `token` for product routes below.

---

### Products (admin only — token required)

Header for all routes below:

```http
Authorization: Bearer <admin_token>
```

#### Create product

```http
POST /api/admin/products
```

**Body:**

```json
{
  "name": "Used Calculus Book",
  "description": "Good condition, 3rd edition",
  "price": 250,
  "stock": 5
}
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `name` | Yes | string | Product title |
| `price` | Yes | number | Price in your currency |
| `description` | No | string | Details about item |
| `stock` | No | number | How many available (default `0`) |

**Success (201):**

```json
{
  "message": "Product created successfully.",
  "product": {
    "id": 1,
    "name": "Used Calculus Book",
    "price": 250,
    "description": "Good condition, 3rd edition",
    "stock": 5,
    "sellerId": 1,
    "createdAt": "2026-05-19T12:00:00.000Z"
  }
}
```

---

#### Get my products (products I listed)

```http
GET /api/admin/products/mine
```

**Success (200):** Array of your products.

---

#### Update product

```http
PUT /api/admin/products/:id
```

Example: `PUT /api/admin/products/1`

**Body** (send only fields you want to change):

```json
{
  "name": "Calculus Book - Updated",
  "price": 200,
  "stock": 3
}
```

You can only edit products **you** created (`sellerId` must match your user id).

---

#### Delete product

```http
DELETE /api/admin/products/:id
```

Example: `DELETE /api/admin/products/1`

**Success (200):**

```json
{
  "message": "Product deleted successfully."
}
```

---

## Public APIs (buyer / student)

Base path: `/api`

### Auth

#### Register student

```http
POST /api/auth/register
```

**Body:**

```json
{
  "name": "Priya Student",
  "email": "priya@college.edu",
  "password": "password123"
}
```

**Success (201):**

```json
{
  "message": "Student registered successfully.",
  "user": {
    "id": 2,
    "name": "Priya Student",
    "email": "priya@college.edu",
    "role": "STUDENT"
  }
}
```

---

#### Student login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "priya@college.edu",
  "password": "password123"
}
```

**Success (200):**

```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Priya Student",
    "email": "priya@college.edu",
    "role": "STUDENT"
  }
}
```

Save the `token` for cart and wishlist.

---

### Products (browse — no login needed)

#### Get all products

```http
GET /api/products
```

**Success (200):**

```json
[
  {
    "id": 1,
    "name": "Used Calculus Book",
    "price": 250,
    "description": "Good condition",
    "stock": 5,
    "sellerId": 1,
    "seller": {
      "id": 1,
      "name": "Rahul Seller",
      "email": "rahul.admin@college.edu"
    },
    "createdAt": "2026-05-19T12:00:00.000Z"
  }
]
```

---

#### Get one product by ID

```http
GET /api/products/:id
```

Example: `GET /api/products/1`

---

### Cart (student token required)

Header:

```http
Authorization: Bearer <student_token>
```

#### Add to cart

```http
POST /api/cart
```

**Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `productId` | Yes | ID from `GET /api/products` |
| `quantity` | No | Default is `1` |

If the same product is added again, **quantity increases** instead of duplicating the row.

**Success (201):**

```json
{
  "message": "Added to cart.",
  "item": {
    "id": 1,
    "cartId": 1,
    "productId": 1,
    "quantity": 2
  }
}
```

---

#### View cart

```http
GET /api/cart
```

**Success (200):** Cart with items and nested `product` details (name, price, etc.).

Empty cart:

```json
{
  "message": "Your cart is empty.",
  "items": []
}
```

---

#### Update cart item quantity

```http
PUT /api/cart/:itemId
```

Example: `PUT /api/cart/1`

**Body:**

```json
{
  "quantity": 3
}
```

`itemId` is the **cart item** id (from `GET /api/cart`), not the product id.

---

#### Remove item from cart

```http
DELETE /api/cart/:itemId
```

Example: `DELETE /api/cart/1`

---

### Wishlist (student token required)

Header:

```http
Authorization: Bearer <student_token>
```

#### Add to wishlist

```http
POST /api/wishlist
```

**Body:**

```json
{
  "productId": 1
}
```

**Success (201):**

```json
{
  "message": "Added to wishlist.",
  "item": {
    "id": 1,
    "wishlistId": 1,
    "productId": 1
  }
}
```

---

#### View wishlist

```http
GET /api/wishlist
```

**Success (200):** Wishlist with items and product details.

---

#### Remove from wishlist

```http
DELETE /api/wishlist/:itemId
```

Example: `DELETE /api/wishlist/1`

`itemId` = wishlist item id from `GET /api/wishlist`.

---

## Quick reference table

| Method | URL | Auth | Role | Description |
|--------|-----|------|------|-------------|
| POST | `/api/admin/auth/register` | No | — | Create admin account |
| POST | `/api/admin/auth/login` | No | — | Admin login, get token |
| POST | `/api/admin/products` | Yes | ADMIN | Create product |
| GET | `/api/admin/products/mine` | Yes | ADMIN | List my products |
| PUT | `/api/admin/products/:id` | Yes | ADMIN | Update my product |
| DELETE | `/api/admin/products/:id` | Yes | ADMIN | Delete my product |
| POST | `/api/auth/register` | No | — | Create student account |
| POST | `/api/auth/login` | No | — | Student login, get token |
| GET | `/api/products` | No | — | Browse all products |
| GET | `/api/products/:id` | No | — | Single product details |
| POST | `/api/cart` | Yes | STUDENT | Add to cart |
| GET | `/api/cart` | Yes | STUDENT | View cart |
| PUT | `/api/cart/:itemId` | Yes | STUDENT | Change quantity |
| DELETE | `/api/cart/:itemId` | Yes | STUDENT | Remove from cart |
| POST | `/api/wishlist` | Yes | STUDENT | Add to wishlist |
| GET | `/api/wishlist` | Yes | STUDENT | View wishlist |
| DELETE | `/api/wishlist/:itemId` | Yes | STUDENT | Remove from wishlist |

---

## Testing with Postman

1. Create a new **Collection** named `Campously`.  
2. Add a collection variable `baseUrl` = `http://localhost:5000`.  
3. After login, copy `token` and set collection variable `token`.  
4. For protected requests, under **Authorization** → Type: **Bearer Token** → paste token.  
5. Under **Body** → **raw** → **JSON**, paste request bodies from this README.

### Example: admin create product

- Method: `POST`  
- URL: `{{baseUrl}}/api/admin/products`  
- Auth: Bearer Token = admin token from login  
- Body: JSON with `name`, `price`, etc.

---

## Common errors

| Status | Message | Fix |
|--------|---------|-----|
| 400 | Missing fields / user exists | Check JSON body; use a new email |
| 401 | No token provided | Add `Authorization: Bearer <token>` |
| 403 | Invalid token / Admin access required | Login again; use correct role URL |
| 404 | Product not found | Check product `id` from `GET /api/products` |
| 500 | Database error | Check `.env` `DATABASE_URL`, run `npx prisma db push` |

---

## Database models (short)

| Model | What it stores |
|-------|----------------|
| `User` | name, email, password, role (`ADMIN` / `STUDENT`) |
| `Product` | item for sale, linked to seller (`sellerId`) |
| `Cart` + `CartItem` | one cart per student, items + quantity |
| `Wishlist` + `WishlistItem` | saved products per student |
| `Order` + `OrderItem` | for future checkout feature |

View/edit data visually:

```bash
npx prisma studio
```

Opens a browser UI at `http://localhost:5555`.

---

## Useful commands

| Command | What it does |
|---------|----------------|
| `npm start` | Run API server |
| `npx prisma db push` | Sync schema to MySQL (no migration files) |
| `npm run seed` | Insert demo users, products, cart & wishlist |
| `npx prisma generate` | Regenerate Prisma client after schema edit |
| `npx prisma studio` | Open database GUI |

---

## Team tips

- Never commit `.env` (it has passwords and secrets).  
- Use **different emails** for admin vs student when testing.  
- Product `id` ≠ cart `itemId` — use the right id in URLs.  
- If the server crashes after schema changes, run `npx prisma db push`, `npx prisma generate`, then `npm run seed`.

---

## License

College project — use and modify as needed for learning.
