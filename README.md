# Prayas - Impact Engine

## 📖 Project Overview
Prayas is a full-stack web application designed for NHPC to manage Corporate Social Responsibility (CSR) volunteer initiatives. The platform connects NHPC employees with NGOs (Partner Organizations) for various volunteering opportunities. 

The application facilitates the entire lifecycle of volunteering:
1. **NGOs/Departments** post volunteer opportunities.
2. **Employees** browse the feed and apply.
3. **Reporting Officers (ROs)** review and approve employee applications.
4. **Administrators (Dept/HR)** oversee the entire platform.

---

## 🏗️ Architecture & Technology Stack
- **Frontend**: Next.js (App Router paradigm), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL (using `mysql2/promise` for connection pooling)
- **Security/Auth**: JSON Web Tokens (JWT), Role-Based Access Control (RBAC)

---

## 📂 Common Features (Frontend & Backend)

### Role-Based Access Control (RBAC)
The platform revolves around a three-tier role system securely enforced on both the client (UI rendering) and server (API access):
1. **Employee (`employee`)**: NHPC staff who can browse, apply for volunteer postings, log hours, and fill out Form A & B.
2. **NGO (`ngo`)**: Partner organizations who create volunteer postings, manage applications, verify hours, and evaluate volunteers.
3. **Department Admin (`dept`)**: Internal HR or CSR departments overseeing the entire workflow and RO approvals.

### JIT (Just-In-Time) Authentication Flow
- The system interacts with an external Mock NHPC Auth service.
- When users log in, their credentials are verified against the central system. If valid, local profiles are dynamically provisioned in the Prayas database (`employees_local`, `ngos_local`, `dept_local`), and a local JWT is issued.

### Form-Based Workflow Lifecycle
The volunteer journey is meticulously managed through structured forms:
- **Form A (Application)**: Initial volunteer application submitted by the employee (includes Medical Certificate handling).
- **Form B (Logs)**: Volunteer activity log for tracking hours over time.
- **Form C & D (Completion)**: Completion and acknowledgement forms pre-filled after approval.
- **Form G (Evaluation)**: Final evaluation submitted by the NGO and RO upon completion.

---

## 💻 Backend Architecture & Functions
The backend serves as a robust REST API, handling database transactions, file storage, and business logic. It is structured into distinct modules under `backend/routes/`.

### Core API Routes

#### 1. Auth (`/api/auth`)
- **Function**: Manages the Just-In-Time authentication flow.
- Intercepts login requests, queries the Mock NHPC Auth API, performs dynamic database inserts for new users, and generates JWT tokens for secure session management.

#### 2. Postings (`/api/postings`)
- **Function**: Handles the CRUD operations for CSR initiatives.
- Allows NGOs to create new volunteer postings (specifying skills, expected hours, location).
- Retrieves paginated feeds for employees to browse active opportunities.

#### 3. Applications (`/api/applications`)
- **Function**: The engine for the 7-step volunteer application workflow.
- **Submission (`POST /apply`)**: Validates inputs (e.g., 10-digit contact numbers) and submits Form A.
- **Approvals (`PATCH /:id/approve`)**: Handles Reporting Officer (RO) approvals and dynamically pre-fills empty templates (Form C & D) upon transition to approved states.
- **Medical Certificates**: Secures file uploads (`PATCH`) via `multer` and strictly authorizes file retrieval (`GET`) to only the applicant, assigned RO, or Dept Admin.

#### 4. Logs (`/api/logs`)
- **Function**: Manages Form B (volunteer hour tracking).
- Accepts hour submissions from employees and facilitates NGO verification for the recorded time.

#### 5. Evaluations (`/api/evaluations`)
- **Function**: Governs the Form G final evaluation process.
- Implements strict authorization validation to verify that the requester specifically owns or has jurisdiction over the requested application ID before granting access or saving edits.

#### 6. Notifications (`/api/notifications`)
- **Function**: Provides dynamic "Action Required" data.
- Reads the user's JWT and queries the database for blocking tasks (e.g., applications pending RO approval for Dept, or Form C submissions for Employees), returning actionable summaries.

#### 7. Admin (`/api/admin`)
- **Function**: Handles global oversight functions and high-level platform analytics for the Department Admin dashboard.

---

## 🖥️ Frontend Architecture & Functions
The frontend is a modern Next.js application designed for responsiveness, fast interactions, and unified user experiences.

### Core App Structure (`frontend/app/`)

#### 1. Authentication Pages (`/login`)
- Role-specific login pages that interface with backend JIT endpoints.

#### 2. Role-Based Dashboards (`/dashboard/`)
- **`/dashboard/employee`**: The central hub for employees. Features the opportunity feed, application status tracking, and logging interfaces.
- **`/dashboard/ngo`**: Allows NGOs to view their active postings, accept/reject incoming applications, and submit volunteer evaluations.
- **`/dashboard/dept`**: The administrative view for HR/CSR to monitor system health, oversee applications, and resolve bottlenecks.

### Shared Components (`frontend/components/`)

#### 1. `<ApplicationViewer />`
- **Function**: A universal, tabbed interface to view an application's lifecycle (Forms A, B, C, D, and G).
- Automatically handles permissions based on the user's JWT, rendering either read-only data or interactive form inputs depending on whose turn it is to act in the 7-step timeline.

#### 2. `<ActionSidebar />`
- **Function**: A globally available notification center on the dashboard.
- Continuously polls the `/api/notifications/action-required` endpoint. It displays actionable cards (e.g., "Pending RO Approval") that, when clicked, route the user directly to the required task.

#### 3. `<TokenExpiry />`
- **Function**: Utility component that monitors the JWT token's validity, ensuring the UI gracefully logs the user out when the session expires.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MySQL Server**
- **Bun** (optional, recommended for fast installation)

### Setup Instructions

1. **Database Setup**: 
   Run the provided `database_migration.sql` script in your MySQL instance to create the necessary tables and schemas.

2. **Backend**:
   ```bash
   cd backend
   npm install # or bun install
   cp .env.example .env # Configure your database credentials and JWT secrets
   npm start # or bun run index.ts
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install # or bun install
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## 🔐 Security Features
- **Strict JWT Validation**: Applied on every API request.
- **Data Ownership Constraints**: Users can only access, view, or edit applications/forms related to their specific IDs. Cross-access is strictly blocked at the backend level.
- **Secure File Storage**: Medical certificates are stored on the server file system (not public folders) with route-protected access requiring authorization.
- **Input Validation**: Hardened validation logic to ensure database integrity (e.g., RegEx validation for phone numbers).
