
# CNotes - Multi-Tenant SaaS Notes Application

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</p>

A full-stack, multi-tenant SaaS application that allows different organizations (tenants) to manage their notes securely. This project demonstrates key SaaS principles including data isolation, role-based access control (RBAC), and subscription-based feature gating.


**Live Demo:** [**C-NOTES**](https://c-notes-nu.vercel.app/)

![CNotes Dashboard Screenshot](https://github.com/user-attachments/assets/babb6f43-c669-4fa7-a1b6-427d2fda534e)

---

## ⚡ Features

-   **Multi-Tenancy Architecture**: Strict data isolation ensures that users from one tenant cannot access data from another.
-   **JWT-Based Authentication**: Secure stateless authentication for all users.
-   **Role-Based Access Control (RBAC)**:
    -   **Admin**: Can manage tenant subscriptions.
    -   **Member**: Can perform CRUD operations on notes within their tenant.
-   **Subscription Feature Gating**:
    -   **Free Plan**: Limited to a maximum of 3 notes per tenant.
    -   **Pro Plan**: Allows unlimited notes.
-   **RESTful API**: A complete set of endpoints for managing notes and tenants.
-   **Minimalist Frontend**: A clean and responsive user interface built with Next.js, React, and shadcn/ui.

---

## 🏛️ Multi-Tenancy Approach

This application implements a **Shared Schema with a Tenant ID Column** approach for multi-tenancy.

-   All tenants share the same database and tables (`User`, `Note`, etc.).
-   A `tenantId` column is present in every tenant-specific table (`User`, `Note`).
-   Every database query is scoped to the `tenantId` of the authenticated user, which is extracted from their JWT token. This ensures strict data isolation at the application layer.

This approach was chosen for its simplicity, lower operational cost, and ease of maintenance, making it ideal for projects of this scale.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Authentication**: [JWT](https://jwt.io/) (jsonwebtoken), [bcryptjs](https://www.npmjs.com/package/bcryptjs)
-   **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [PostgreSQL](https://www.postgresql.org/download/) database instance

### 1. Clone the Repository

```bash
git clone https://github.com/al0nec0der/cnotes.git cnotes
cd cnotes
````

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Configure Environment Variables

Create a `.env` file in the root of the project and add the following variables.

```env
# Example .env file

# Your PostgreSQL connection string.
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/cnotes"

# For Prisma migrations, often the same as DATABASE_URL but without pooling.
DIRECT_URL="postgresql://postgres:password@localhost:5432/cnotes"

# A strong, secret key for signing JWTs.
# You can generate one using: openssl rand -hex 32
JWT_SECRET="your_super_secret_jwt_key"
```

### 4\. Set Up the Database

Run the Prisma migration command to set up your database schema.

```bash
npx prisma migrate dev
```

### 5\. Seed the Database

Populate the database with the mandatory test tenants and users.

```bash
npm run seed
```

### 6\. Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

-----

## 🚀 Usage

You can log in and test the application using the predefined accounts.

**Password for all accounts:** `password`

| Email                | Role   | Tenant | Plan |
| -------------------- | ------ | ------ | ---- |
| `admin@acme.test`    | Admin  | Acme   | Free |
| `user@acme.test`     | Member | Acme   | Free |
| `admin@globex.test`  | Admin  | Globex | Free |
| `user@globex.test`   | Member | Globex | Free |

-----

## 🔐 API Endpoints

The following API endpoints are available:

| Method | Endpoint                      | Description                                | Access          |
| :----- | :---------------------------- | :----------------------------------------- | :-------------- |
| `POST` | `/api/auth/login`             | Authenticate a user and get a JWT token.   | Public          |
| `GET`  | `/api/health`                 | Health check endpoint.                     | Public          |
| `POST` | `/api/notes`                  | Create a new note.                         | Authenticated   |
| `GET`  | `/api/notes`                  | Get all notes for the user's tenant.       | Authenticated   |
| `GET`  | `/api/notes/:id`              | Get a specific note by ID.                 | Authenticated   |
| `PUT`  | `/api/notes/:id`              | Update a specific note.                    | Authenticated   |
| `DELETE`| `/api/notes/:id`              | Delete a specific note.                    | Authenticated   |
| `POST` | `/api/tenants/:slug/upgrade`  | Upgrade a tenant's plan to "PRO".          | Admin Only      |

-----

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push to GitHub**: Push your cloned and configured repository to your own GitHub account.
2.  **Import Project**: On the Vercel dashboard, click "Add New... -\> Project" and import your GitHub repository.
3.  **Configure Environment Variables**: In the project settings on Vercel, add the same environment variables from your `.env` file (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`).
4.  **Deploy**: Vercel will automatically detect that it's a Next.js project and deploy it. Any future pushes to the `main` branch will trigger automatic redeployments.

-----

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

-----

## 👤 Contact

**AloneCoder**


  * **GitHub**: [github.com/al0nec0der](https://www.google.com/search?q=https://github.com/al0nec0der)
  * **LinkedIn**: [linkedin.com/in/codewithteja](https://linkedin.com/in/codewithteja)


