Major Module: Content Moderation & Report Ticket System

Why we chose this module

The advanced permissions system (roles, CRUD on users) naturally extended into a real need: without a way for users to report abusive content and for moderators to act on those reports, the permission system is an empty shell. We built a full-fledged moderation pipeline — report submission, ticket assignment, review workflow, ban/unban with cascading effects — to give the RBAC system a concrete, production-grade purpose.

Technical challenges addressed

- Stateful ticket lifecycle with 4 states (PENDING → ASSIGNED → ACCEPTED/REJECTED): reports are grouped by target (post or user), bulk-assigned to a moderator, and bulk-resolved in a single atomic Prisma transaction, preventing race conditions and partial states.
- Granular RBAC at two levels: a permission matrix (permissions.ts) maps 10 distinct actions to roles, enforced both by NestJS @‌Roles() guards on routes and by hasPermission() checks in business logic. Admins handle user reports and bans; Mods handle post reports. Each role sees a different dashboard, different sidebar menus, and different data.
- Cascading side-effects on ban: banning a user triggers, within a single transaction, soft-deletion of all their posts and comments (bannedDeletion flag), removal of those posts from active tournaments (handleBannedPostInTournament), and winner resets. Unbanning reverses only the ban-related deletions, preserving moderator-deleted content.
- Cross-cutting integrations: each moderation action triggers email notifications (ban/unban/report confirmation/report outcome via MailService), in-app notifications (promotion/demotion via NotificationsService), and an immutable audit trail (ModerationLog with actor, target user/post/battle).
- Report-driven content isolation: reporting a post or user immediately hides the content for the reporter (PostHiddenForUser, UserHiddenForUser) and removes any existing friendship, all within the same transaction.

How it adds value to the project

- Users have a safe, intuitive way to flag content (4 categories: SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, OTHER) with confirmation emails.
- Moderators get a structured ticket queue (pending / assigned to me / all assigned / resolved) with report counts per target, avoiding duplicate work.
- Admins have full visibility: all user reports, ban management, role promotions, and a complete audit log of every moderation action.
Every action is traceable — the ModerationLog table creates a tamper-proof history linking actor, action, and target.

Why it deserves Major module status

- Backend: ~1800 lines of service logic, 425 lines of API layer, 20+ REST endpoints protected by role-based guards, 6 Prisma models (Report, ModerationLog, PostHiddenForUser, UserHiddenForUser + extensions to User/Post/Comment), a full permission matrix of 10 actions, and integration with 3 modules (Mail, Notifications, Tournament).
- Frontend: 38 files totaling ~2600 lines of TypeScript/React and ~1200 lines of CSS. This includes 25 React components, 14 dedicated report views (pending/assigned/handled/detail pages for both post and user reports), 2 custom hooks (useHandleReport, usePostReport), 19 routes, and 22 API calls. Two fully separate role-specific dashboards (Admin and Mod) each with their own sidebar navigation, report queues, user management panels, and log viewers. The DashboardPage handles tab switching, route memory per role, and unauthorized access redirection.
The module implements a real-world ticket system with complex transactional workflows (bulk assignment, cascading bans, tournament cleanup) that goes well beyond simple CRUD.
*This project has been created as part of the 42 curriculum by chheniqu, armarboe, aroualid, and lshiina-.*

## Description

Our project, Libftea, is a social platform designed for fashion enthusiasts who want to share their style and connect with a like-minded community. Users can post outfit photos, interact with friends and other fashion lovers, and engage with content through likes and comments, creating an interactive and inspiring space for self-expression through clothing.

The goal of Libftea is to build a thriving fashion community where people can discover new styles, get inspired by others, and showcase their own creativity, all of that on our platform.

## Team Information

# chheniqu

# armarboe

# aroualid

# lshiina-

## Project Management

Our team organized the project by distributing work according to features, with each member taking ownership of specific parts of the application, both front and backend. This allowed us to work in parallel efficiently while keeping responsibilities clear.

To manage tasks and track progress, we used Trello to create and assign card for each module and feature, giving the whole team a clear overview of what was in progress, pending, or done.

Github was used for version control, allowing us to collaborate on the codebase, review each other's work through pull requests, and manage branches by feature.

For communication, we relied on Discord as our main channel for day-to-day discussions and quick updates. We also held bi-weekly team meetings to sync on progress, address blockers, and plan the work ahead for the coming week.

## Technical Stack

The combination of React and NestJS with TypeScript on both ends was chosen to ensure consistently and reduce context-switching for the team. PostgreSQL paired with Prisma gave us a robust and developer-friendly data layer, while Docker ensured that the project ran identically on every machine regardless of local configuration.

# Frontend

The frontend was built with React, using TypeScript for static typing and improved code reliability. Stlying was handled with Tailwind CSS, which allowed us to build a consistent and responsive UI quickly without writing custom CSS from scratch.

# Backend

The backend was developed with NestJS, a structured Node.js framework that encourages a modular and scalable architecture. TypeScript was used across the backend as well, ensuring type safety throughout the entire codebase. Anthentication was implemented using JWT (JSON Web Tokens), providing a stateless and secure way to manage user sessions.

# Database

We chose PostgreSQL as out database system for its reliability, support for complex relational data, and strong community support. It was a natural fit for our data model, which involves relationships between users, posts, and interactions. Database access was managed through Prisma, an ORM that simplified query writing and schema management while keeping things type-safe.

# Infrastructure

The project was containerized using Docker, making it easy to set up consistent development environments across the team and simplifying future deployment.

## Database Schema

## Features List

## Modules

## Individual Contributions

## Instructions

# Prerequisites

Make sure the following tools are installed on your machine before getting started:
- docker and docker Compose
- make
- npm

1. Get the repository

You can git clone the repository from the link provided in the evaluation sheet.

2. Set up environment

You can set up the necessary environment variables by copying the contents of the .env.example file located at the root of the repository into a .env file that you can create in the backend repository

3. Start the project

Simply the command "make start" in a terminal you opened from the root of the repository

4. Acces all the available features

Once the application is running, you can either create you own user account directly, or use on of our pre-created accountes available in the database:
- Regular users: ari, cha, leo, ophe
- Moderator: mod
- Administrator: admin
All pre-created acounts share the same password: Password0+

## Resources

# Documentation

The following official and classic documentation was consulted throughout the project: 
- https://react.dev/learn
- https://docs.nestjs.com/
- https://www.prisma.io/docs
- https://www.postgresql.org/docs/
- https://tailwindcss.com/docs
- https://docs.docker.com/
- https://jwt.io/introduction

# AI Usage

Several AI tools were used during the development of the project, strictly as assistance tools:
- Gihub Copilot was used to help with code completion and suggest implementations during development
- ChatGPT and Claude were used to better understand certain concepts, debug issues, and help identify cause of errors encountered throughout development

All code was reviewed, understood and validated by the team before integration. AI was never used to generate entire features autonomously.

# Support for additional browsers (1pt)

- **Implementation**: Cross-browser compatibility, ensured through consistent testing, using different browsers as we developped the application/

Libftea was tested on:
- Google Chrome
- Mozilla Firefox
- Safari

Browser specific issues were minor and fixed (e.g. inability to load MarkDown files with Google Chrome). As of this evaluation, all features behave consistently across the three browsers specified above.

- **Features**:
	- Full compaibility with at least two additional browsers
	- All features tested and fixed in each browser
	- Consistent UI/UX across all supported browsers
	- No remaining browser-specific limitations
