_This project has been created as part of the 42 curriculum by armarboe, chheniqu, aroualid, and lshiina-._


## Description

Our project, Libftea, is a social platform designed for fashion enthusiasts who want to share their style and connect with a like-minded community. Users can post outfit photos, interact with friends and other fashion lovers, and engage with content through likes and comments, creating an interactive and inspiring space for self-expression through clothing.

The goal of Libftea is to build a thriving fashion community where people can discover new styles, get inspired by others, and showcase their own creativity, all of that on our platform.

After signing up and logging in, users can access a news feed displaying outfits posted by other users. Each post can be liked and commented on, with interactions updated in real time to ensure a smooth and engaging experience.
Each user has a personal profile page that includes their profile picture, their published outfits, and all associated interactions (likes and comments). Users can also browse other profiles, add friends, view online status, as well as block or report other users when necessary.
The platform also features a tournament system based on themed challenges. Administrators can create competitions where users participate by submitting their outfits. The community can vote for a defined period, and a winner is automatically selected at the end of the tournament.
A notification system keeps users informed in real time about interactions related to their activity, such as likes, comments, or tournament results.
The entire application is designed to provide a smooth, interactive, and community-driven user experience.

## Team Information

# chheniqu
Product Owner (PO) Defined the product vision and concept of Libftea as a fashion social network. Designed the visual identity and UI/UX direction. Created the Prisma database schema. Responsible for feature prioritization and validation of completed work.

# armarboe
Technical Lead / Architect Defined the technical architecture and chose the technology stack (React/TypeScript, NestJS, Prisma, PostgreSQL). Set up the project structure, organized the Trello board, and created reusable components shared across the application. Ensured code quality and reviewed critical changes.

# aroualid

# lshiina-
Project Manager / Scrum Master Facilitated team coordination and planning sessions. Tracked progress and deadlines. Ensured communication within the team and managed blockers.

## Project Management

# Work organization
The team followed an iterative and collaborative workflow throughout the project.
Weekly meetings were held to review overall progress, discuss blockers, and adjust priorities. During these meetings, tasks were redistributed based on each member’s progress and the current needs of the project.
At the beginning of the project, each team member was assigned a major module to take ownership of, ensuring clear responsibility and deeper technical involvement. However, the workflow remained flexible, allowing collaboration and mutual support when needed.
Additionally, during the early stages of development, the team worked in the same cluster environment, which facilitated real-time communication, quick problem-solving, and efficient coordination.

# Project management tools
GitHub: used for version control, pull requests, and issue tracking
Trello: used for task organization, backlog management, and progress tracking

# Communication
Discord: main communication channel for daily discussions, quick questions, and coordination

## Technical Stack

The combination of React and NestJS with TypeScript on both ends was chosen to ensure consistently and reduce context-switching for the team. PostgreSQL paired with Prisma gave us a robust and developer-friendly data layer, while Docker ensured that the project ran identically on every machine regardless of local configuration.

# Frontend

React (TypeScript):
Used to build a dynamic and component-based user interface. React allows efficient state management and reusable UI components, improving maintainability and scalability.

Tailwind CSS:
Chosen over traditional CSS to enable faster and more consistent styling. Its utility-first approach improves development speed, enforces design consistency, and reduces the need for custom CSS.

# Backend

Selected for its modular architecture and strong structure inspired by enterprise frameworks, the backend was developed with NestJS.It provides scalability, maintainability, and clear separation of concerns. NestJS is widely used in professional environments, making it a relevant choice for real-world development. TypeScript was used across the backend as well, ensuring type safety throughout the entire codebase. Anthentication was implemented using JWT (JSON Web Tokens), providing a stateless and secure way to manage user sessions.

# Database

We chose PostgreSQL as out database system for its reliability, support for complex relational data, and strong community support. It was a natural fit for our data model, which involves relationships between users, posts, and interactions. It was chosen for its reliability, performance, and widespread adoption in production environments.
Database access was managed through Prisma, an ORM that simplified query writing and schema management while keeping things type-safe and helps prevent common vulnerabilities such as SQL injections.

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

You can set up the necessary environment variables by copying the contents of the .env.example file located at the root of the repository, and adding the values we will give you into a .env file that you can create in the backend repository

3. Start the project

Simply the command "make start" in a terminal you opened from the root of the repository

4. Acces all the available features

Once the application is running, you can either create your own user account directly, or use one of our pre-created accountes available in the database:

- Regular users: ari, cha, leo, ophe
- Moderator: mod
- Administrator: admin
- Test user for report and ban system: toxic
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
  - No significant browser-specific limitations


## Major Module: Content Moderation & Report Ticket System

### Why we chose this module

The advanced permissions system (roles, CRUD on users) naturally extended into a real need: without a way for users to report abusive content and for moderators to act on those reports, the permission system is an empty shell. We built a full-fledged moderation pipeline — report submission, ticket assignment, review workflow, ban/unban with cascading effects — to give the RBAC system a concrete, production-grade purpose.

### Technical challenges addressed

- **Stateful ticket lifecycle** with 4 states (PENDING → ASSIGNED → ACCEPTED/REJECTED): reports are grouped by target (post or user), bulk-assigned to a moderator, and bulk-resolved in a single atomic Prisma transaction, preventing race conditions and partial states.
- **Granular RBAC at two levels**: a permission matrix (permissions.ts) maps 10 distinct actions to roles, enforced both by NestJS @‌Roles() guards on routes and by hasPermission() checks in business logic. Admins handle user reports and bans; Mods handle post reports. Each role sees a different dashboard, different sidebar menus, and different data.
- **Cascading side-effects on ban**: banning a user triggers, within a single transaction, soft-deletion of all their posts and comments (bannedDeletion flag), removal of those posts from active tournaments (handleBannedPostInTournament), and winner resets. Unbanning reverses only the ban-related deletions, preserving moderator-deleted content.
- **Cross-cutting integrations**: each moderation action triggers email notifications (ban/unban/report confirmation/report outcome via MailService), in-app notifications (promotion/demotion via NotificationsService), and an immutable audit trail (ModerationLog with actor, target user/post/battle).
- **Report-driven content isolation**: reporting a post or user immediately hides the content for the reporter (PostHiddenForUser, UserHiddenForUser) and removes any existing friendship, all within the same transaction.

### How it adds value to the project

- **Users**: Safe, intuitive way to flag content (4 categories: SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, OTHER) with confirmation emails.
- **Moderators**: Structured ticket queue (pending / assigned to me / all assigned / resolved) with report counts per target, avoiding duplicate work.
- **Admins**: Full visibility of all user reports, ban management, role promotions, and a complete audit log of every moderation action. Every action is traceable — the ModerationLog table creates a tamper-proof history linking actor, action, and target.

### Why it deserves Major module status

**Backend**
- ~1800 lines of service logic, 425 lines of API layer
- 20+ REST endpoints protected by role-based guards
- 6 Prisma models (Report, ModerationLog, PostHiddenForUser, UserHiddenForUser + extensions to User/Post/Comment)
- Full permission matrix of 10 actions
- Integration with 3 modules (Mail, Notifications, Tournament)
**Frontend**
- 38 files totaling ~2600 lines of TypeScript/React and ~1200 lines of CSS
- 25 React components, 14 dedicated report views (pending/assigned/handled/detail pages for both post and user reports)
- 2 custom hooks (useHandleReport, usePostReport), 19 routes, 22 API calls
- Two fully separate role-specific dashboards (Admin and Mod) with sidebar navigation, report queues, user management panels, and log viewers
- DashboardPage handles tab switching, route memory per role, and unauthorized access redirection
**Production-grade system**: This is not basic CRUD — it's a real-world ticket system with complex transactional workflows (bulk assignment, cascading bans, tournament cleanup) that goes well beyond simple features.
