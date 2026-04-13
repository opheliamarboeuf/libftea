## Description

Libftea is a social platform for fashion enthusiasts to share outfits, connect with others, and discover new styles. Users can post content, interact through likes and comments, and explore a community built around self-expression through clothing.

The platform includes:
- A news feed with real-time interactions
- User profiles with posts, likes, and comments
- Social features (friends, online status, blocking/reporting)
- Themed tournaments where users compete and vote
- A real-time notification system

## Live Demo (Frontend Showcase)

A public version of the project is available to showcase the interface and user experience without local setup:

https://opheliamarboeuf.github.io/libftea

This version runs frontend-only:

- Authentication and backend features are disabled
- Users can select predefined accounts to explore the UI

After landing on the homepage, you will be redirected to a user selection page where you can choose from predefined accounts. This allows immediate access to the application interface and enables you to explore the different pages and UI components as they would appear in a real user session.

To access full functionality (backend, database, real-time features, authentication, etc...), please run the project locally using the instructions below.

## Technical Stack

### Frontend

- React (TypeScript): Component-based UI with strong typing for maintainability
- Tailwind CSS: Utility-first styling for fast and consistent design

### Backend

- NestJS (TypeScript): Modular and scalable architecture with clear separation of concerns
- JWT Authentication: Stateless and secure session management

### Database

- PostgreSQL: Reliable relational database suited for structured data (users, posts, interactions)
- Prisma: Type-safe ORM simplifying queries and schema management

### Infrastructure

The project was containerized using Docker, making it easy to set up consistent development environments across the team and simplifying future deployment.

## Features List

- Authentication & Security: Email login, GitHub OAuth, JWT, 2FA
- User Profiles: Custom profiles with avatars, bios, and posts
- Posts & Feed: Create, edit, and explore posts in a global timeline
- Social Interactions: Likes, comments, replies, and friend system
- Real-Time Chat: Private messaging with WebSockets
- Tournaments: Themed competitions with voting and automatic winners
- Notifications: Real-time updates for user activity
- Internationalization: Multi-language support (EN / FR / JP)
- Moderation & Admin: Roles, reports, bans, and admin dashboard, email notifications

## Personal Contributions

I worked on both frontend and backend across multiple core features:

- **User Profiles**: Built full profile system (view/edit, image upload with validation, server-side resizing, access control for blocks/bans)  
- **Posts & Feed**: Implemented post CRUD and feed filtering (blocks, reports, hidden content, tournaments)  
- **Moderation System**: Designed complete report/ticket pipeline (lifecycle, role-based permissions, admin/mod dashboards, ban/unban with cascading effects, audit logs)  
- **Authentication & Security**: Implemented JWT auth, GitHub OAuth, and 2FA via email with secure code handling  
- **Mail Service**: Centralized email system (2FA, moderation actions, notifications) using Nodemailer + Handlebars  
- **Frontend Architecture**: Developed reusable components, global state management, and UI structure for consistency across the app  
- **Database Seeding**: Created a comprehensive seed script with realistic, interconnected data for testing all features  

**Key focus areas:** complex data filtering, transactional integrity (Prisma), and scalable architecture across frontend and backend.

## Instructions

### Prerequisites

Make sure the following tools are installed:

- Docker & Docker Compose  
- Make  
- npm

#### 1. Clone the repository
```bash
git clone git@github.com:opheliamarboeuf/libftea.git
cd libftea
```

#### 2. Set up environment

Copy the `.env.example` file and create a `.env` file
```bash
cp .env.example .env
```

#### 3. Start the project

Run the following command from the root of the repository

```bash
make start
```

#### 4. Access all the available features

Once the app is running, you can:

- Create a new account
- Or use pre-created accounts:
  - Users: ari, cha, leo, ophe
  - Admin: admin
  - Moderator: mod
  - Test user (moderation): toxic

All accounts use the same password:
Password0+

#### 5. View emails during development

All emails (2FA, moderation, notifications) are captured by Mailpit:
**http://localhost:8026**

This allows you to test authentication and moderation flows without sending real emails.
