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

# Other technologies and libraries

WebSockets (if applicable)Used to handle real-time features such as live notifications and interactions.

# Justification of technical choices

The technical stack was chosen to reflect modern industry standards and best practices:
Use of TypeScript across the entire project ensures consistency and reliability
React and Tailwind provides a fast, scalable, and maintainable frontend
NestJS offers a clean and structured backend architecture suitable for complex applications
PostgreSQL and Prisma ensures secure, efficient, and scalable data management
Overall, these choices allow the application to be scalable, maintainable, secure, and aligned with real-world development practices.

# Infrastructure

The project was containerized using Docker, making it easy to set up consistent development environments across the team and simplifying future deployment.

## Database Schema

# Overview

The application is built on a relational database (PostgreSQL) structured around core social network entities such as users, posts, interactions, and tournaments.
The schema is designed to ensure:

- data integrity through strong relations and constraints
- scalability for social features (likes, comments, friendships, messaging)
- support for advanced modules such as moderation and tournaments

# Core entities and relationships

User:

- Central entity of the application
- Stores authentication data, role (USER, ADMIN, MOD), and account status (banned)
- Relations: posts (one-to-many), comments (one-to-many), likes (one-to-many), friendships (self-relation), messages and conversations, notifications, reports and moderation logs

Post:

- Represents an outfit shared by a user
- Contains image, caption, title, timestamps
- Relations: belongs to one user (author), has many likes and comments, can participate in a tournament (BattleParticipant), can be reported or hidden

Comment:

- Linked to a post and a user
- Supports nested comments via a self-relation (replies system)

Like:

- Connects a user to a post
- Enforced constraint: one like per user per post (@@unique[userId, postId])

Friendship:

- Self-relation between users
- Includes status (PENDING, ACCEPTED, BLOCKED)
- Enforces uniqueness between two users

Conversation & Message:

- Messaging system between users
- A conversation contains multiple messages
- Supports real-time communication features

Battle:

- Represents a tournament
- Key fields: theme, startsAt, endsAt, status (UPCOMING, ACTIVE, FINISHED), winnerId (linked to User)

BattleParticipant:

- Junction table linking: a user, a post, a tournament
- Enforces:
  one participation per user per tournament (@@unique[battleId, userId])

Report:

- Allows users to report posts or other users
- Includes: report type (SPAM, HARASSMENT, etc.), status (PENDING, ACCEPTED, REJECTED)
- Linked to: reporter (User), target (User or Post), moderator handling the report

ModerationLog:

- Stores all moderation actions (ban, delete, role changes, etc.)
- Ensures traceability with: actor (admin/mod), target (user, post, or tournament)

Notification:

- Stores user notifications
- Includes: type (LIKE, COMMENT, BATTLE_WIN, etc.), read status,optional metadata (JSON for flexibility)

PostHiddenForUser / UserHiddenForUser:

- Allow users to hide posts or other users
- Implemented through junction tables with uniqueness constraints

Additional entities:

- Profile: stores user profile data (avatar, bio, cover)
- Tag / PostTag: tagging system for posts (many-to-many relationship)

Key design choices:

- Strong use of relations to model a real social network structure
- Junction tables (BattleParticipant, PostTag, Hidden entities) to handle many-to-many relationships
- Database constraints (@@unique) to enforce business rules (e.g. one like per post, one participation per tournament)
- Enums to standardize states (roles, reports, tournament lifecycle, notifications)
- Soft deletion patterns (deletedAt, bannedDeletion) to preserve data integrity while hiding content

## Features List

# Landing & Authentication (armarboe, chheniqu)

- Landing page presenting the platform, its concept, and key features
- User registration with email and password
- User login system
- GitHub OAuth authentication
- Two-Factor Authentication (2FA) via email code
- Form validation and error handling
- JWT-based authentication and protected routes

# User Profile (armarboe)

- Personal profile page displaying user information
- Avatar and cover image upload
- Bio editing
- Display of user's posts
- Access to profile settings

# Posts (armarboe)

- Create a post with image, title, and caption
- Edit and delete own posts
- Tag system for categorizing posts
- Global feed (timeline) displaying posts
- Ability to hide posts from specific users

# Likes & Comments (lshiina-)

- Like and unlike posts
- Comment on posts
- Reply to comments (nested comment system)
- Delete own comments

# Friends (lshiina-, armaboe)

- Send, accept, and reject friend requests
- Block other users
- Friends list management
- View online status of friends

# Chat (aroualid)

- Private conversations between users
- Real-time messaging using WebSockets
- Persistent message history
- Invitation system to invite users to join tournaments via messaging

# Tournament / Battle (chheniqu)

- Create tournaments with theme, description, rules, max players, and start/end dates (admin only)
- Plan tournaments in advance
- Join a tournament by submitting a post
- Tournament lifecycle management (UPCOMING → ACTIVE → FINISHED)
- Voting system with like-based ranking
- Automatic winner selection at the end of the tournament
- Winner highlight (“Last week’s winner”) displayed in the next tournament

# Notifications (lshiina-)

Real-time notifications for:

- likes
- comments and replies
- friend requests and acceptances
- new tournaments
- tournament results (win/end)
- role changes (promotion/demotion)
- Mark notifications as read

# Internationalisation (i18n) (lshiina-, chheniqu)

- Full UI translation in:
  - English
  - French
  - Japanese
- Language switcher available in the interface

# Moderation & Admin (armarboe)

- Role-based access control (USER, MOD, ADMIN)
- Report system for posts and users:
  - spam
  - harassment
  - inappropriate content
  - other

- Moderation dashboard for admins and moderators
- Ban and unban users
- Delete any post
- Promote and demote users (MOD / ADMIN)
- Moderation logs ensuring full action traceability

# Legal (lshiina-, chheniqu)

Privacy Policy page (EN / FR / JP)
Terms of Service page (EN / FR / JP)
Accessible links from login and registration pages

## Modules

# Major modules

- The use of frontend and backend frameworks (React + NestJS) provides a solid and scalable foundation aligned with industry standards.
- Real-time features are essential for a social platform, enabling live chat and instant notifications, which significantly improve user engagement.
- The user interaction module (profiles, friends, messaging) forms the core of the social experience and is fundamental to the platform.
- Authentication and user management ensure secure access and personalized user experiences.
- The advanced permission system allows structured moderation and role-based access, which is crucial for maintaining a safe community.

# Minor modules:

- Prisma ORM ensures secure and maintainable database interactions.
- The notification system enhances user engagement by keeping users informed of activity.
- Internationalisation (i18n) makes the platform accessible to a broader audience.
- OAuth and 2FA strengthen security and improve user experience.
- Advanced chat features enrich communication between users.
- Multi-browser support ensures accessibility and consistent experience across platforms.

## Individual Contributions

### chheniqu

# Fashion Tournament System (Minor of Choice)

- Designed and implemented the full tournament system
- Tournament creation (admin only) with theme, rules, max players, and scheduling
- Tournament lifecycle management (UPCOMING → ACTIVE → FINISHED)
- Participation system (submit a post to join a tournament)
- Like-based voting system with consistency constraints
- Automatic winner selection at the end of the tournament
- Winner highlight system (“Last week’s winner”)

# Content Structuring & Feed Logic

- Ensured tournament posts are excluded from the main feed and friends feed
- Created a dedicated tournament posts section on user profiles
- Added tournament context to posts (display of tournament theme)

# Authentication & Security

- Implemented registration and login system
- Password hashing and secure storage
- Validation to prevent duplicate users in the database
- Enforced strong password requirements

# Database & Backend Setup

- Designed the complete Prisma database schema
- Set up Prisma ORM for secure database access
- Created all Dockerfiles and docker-compose from scratch for the full project

# Frontend & UI/UX (Direction Artistique)

- Defined the overall Direction Artistique (DA) of the application
- Ensured UI consistency across all pages
- Reviewed and refined CSS for all team members’ work
- Designed and implemented:
  - landing page (including animated visuals)
  - default user profile layout
  - language switcher interaction (hover-based UI)

# Cross-browser Compatibility

- Ensured the application works consistently across multiple browsers
- Tested and fixed UI/UX inconsistencies
- Multi-browser support required resolving layout issues and differences in rendering

# Project Setup

- Setup of the frontend and backend architecture (React + NestJS)

# Challenges Faced and Solutions

- Achieving a visually appealing and consistent design across all pages was complex
- Transitioning from standard CSS to Tailwind caused major conflicts
- Resolving merge conflicts when unifying branches on main took significant effort
- Managing different module versions also created additional conflicts that needed careful resolution

# lshiina-

I implemented the friends system as part of the user interaction module, which includes:

- adding and removing friends
- accepting and rejecting friend requests
- blocking and unblocking users
  The difficulty of this feature was to handle the different states of the relationships while keeping UI and real time implementation in sync. This was overcome by implementing clear backend logic thanks to the prisma schema written by chheniqu.

I also implemented real-time features using websockets (socket.io) with NestJS gateways. The features working in real time include:

- updated likes on posts
- real time apparition/disparition of comments and replies
- notifications
- etc...
  At first it was hard to juggle between the different sockets and rooms, as all real time features do not need to happen across all users, but I was able to fix it by clearly separating public (for everyone to see) and private events (only between two users).

I worked on the notification system, sending relevant notifications to the right users. The latter are notified when:

- another user likes their post
- another user send a friendship requests
- another user comments under their post
- etc...
  The main difficulty was to make sure that the right user only received the notification once, which I managed to do by only triggering events based on key actions.

I also worked on the localization of the application, implementing french and japanese text on top of the classic english. I used react-i18next as the internationalization framework, directly from the React library. There is a language switcher on all user facing pages of the application.
It was difficult to track all user facing text and make sure to translate it, especially when the logic is more complex than simple JSX text. The solution was simply to keep an eye out and be rigorous, as well as ask other colleagues if they found anything that was not translated.

I also made sure with my colleagues that the applicaiton ran smoothly across these three browsers: Safari, Chrome, and Firefox. As we constantly used these three browsers during development, no significant browser-specifi limitations were observed, except the display of Markdown content on Chrome, which was quickly fixed.

For all of the features above, I wrote the backend as well as the frontend part (except for browser compatibility, it did not require backend coding).

## armarboe

I worked on both the frontend and backend for all the features described below.

# User Profile

I implemented the complete user profile system, which includes:
- personal profile page displaying user information (avatar, cover image, bio, posts)
- viewing other users' profiles with access control (respecting blocks and reports)
- editing profile information (bio, avatar, cover image) with file upload validation (max 5MB, JPEG/PNG/WebP)
- server-side image resizing using Sharp
- ban protection preventing banned users from editing their profile
  The main challenge was handling image processing robustly while keeping the UI responsive. I solved this with server-side resizing and proper error handling to ensure a smooth experience regardless of the file submitted.

# Posts & Feed

I built the full post system (creation, editing, deletion) and feed logic:
- post creation with title, caption, and image upload (resized server-side)
- post editing and deletion with permission checks (author, admin, or mod)
- global feed and friends-only feed with filtering (excluding blocked/reported users, hidden content, and tournament posts)
- tag system for categorizing posts
- soft deletion with moderation tracking (bannedDeletion flag)
  The feed filtering logic was complex due to many edge cases (blocks, reports, hidden posts, tournament-specific posts). I solved this by building layered Prisma queries that combine these filters cleanly.

# Content Moderation & Report Ticket System (Major Module)

I designed and implemented the entire moderation pipeline, which includes:
- report submission with 4 categories (SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, OTHER)
- stateful ticket lifecycle (PENDING → ASSIGNED → ACCEPTED/REJECTED) with atomic Prisma transactions
- permission matrix mapping 10 actions to roles, enforced by NestJS guards and business logic checks
- two role-specific dashboards (Admin and Mod) with separate views and report queues
- ban/unban with cascading side-effects (soft-deletion of posts/comments, tournament cleanup, winner resets)
- moderation logs for full audit traceability
- role management (promote/demote with constraints)
  The biggest challenge was orchestrating cascading ban effects across multiple modules while ensuring atomicity. I wrapped all operations in a single Prisma transaction and integrated with the Mail, Notifications, and Tournament services.

# Mail Service

I set up the email service using Nodemailer with Handlebars templates:
- 2FA verification codes
- ban and unban notifications
- report confirmation and report outcome emails
- deduplication logic to avoid sending multiple emails to the same reporter
  The challenge was making the system reusable across modules (auth, moderation), which I solved by centralizing it into a dedicated MailService with typed payloads.

# Authentication & Security

I implemented the following authentication features:
- Two-Factor Authentication (2FA) via email with 6-digit codes and 10-minute expiration
- GitHub OAuth 2.0 with automatic account linking or creation
- JWT-based authentication with role claims
- ban enforcement at login and 2FA verification
  The difficulty with 2FA was managing the two-step login flow while preventing timing attacks. I handled this by storing hashed codes server-side with strict expiration and providing clear frontend feedback at each step.

# Test Database & Seed Script

I created a comprehensive seed script (~400+ lines) to populate the database with realistic test data:
- pre-created users with different roles (USER, MOD, ADMIN)
- posts with comments, nested replies, and likes
- friendships, conversations, and messages
- moderation logs and notifications
- image preprocessing with Sharp and idempotent execution
  The challenge was creating interconnected data that showcases every feature without conflicts, which I ensured through careful ordering and randomized dates to simulate natural activity.

# Reusable Frontend Components & Architecture

I built shared components and patterns used across the entire application:
- ConfirmDialog: reusable confirmation modal used before any destructive action
- ModalContext / showModal: global toast system accessible from anywhere in the app
- UserContext: centralized user state management with refreshUser() to sync with the backend
- custom hooks: useModalAnimation, useDropdownMenu, useBeforeUnload
- layout components: Header, LeftMenu, SearchBar
  I structured the overall frontend design by defining the placement and ergonomics of UI elements to ensure a coherent and professional experience. The challenge was keeping abstractions generic enough for team-wide adoption while remaining simple to use.

# Challenges Faced and Solutions

- Orchestrating cascading ban effects across multiple modules while maintaining atomicity was the most complex challenge, solved with Prisma transactions and cross-module service integration
- Creating a realistic seed database covering all features without conflicts required careful ordering and idempotent logic
- Designing two separate admin/mod dashboards with distinct permissions and views required careful route management and component architecture
- Designing reusable components (ConfirmDialog, modals, context providers) generic enough for the whole team while keeping interfaces minimal

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

## Minor of Choice: Fashion Tournament System

The fashion tournament is a core feature of Libftea, designed to boost user engagement around a creative and social theme: personal style and fashion.  
This module introduces a recurring event-based system (weekly) that encourages users to actively participate, interact with others, and return regularly to the platform. It also structures content around challenges, giving users a clear goal: winning the tournament.

### Technical Challenges Addressed

#### Plannable Tournament Lifecycle Management

- Implementation of a state system (UPCOMING → ACTIVE → FINISHED) with controlled transitions
- Ability to create tournaments in advance (scheduling)
- Automatic activation at a specified date
- Automatic closure with end-of-tournament processing
- Only administrators can create and schedule tournaments, ensuring global control and preventing abuse

#### Prevention of Tournament Conflicts

- Rules enforced to prevent overlapping tournaments
- Only one tournament can be active at a time, ensuring a clear user experience

#### Secure and Consistent Voting System

- One vote per user per post
- Users cannot vote for their own posts
- Users can only participate once per tournament
- Prevention of duplicates through database constraints
- Consistency under concurrent requests

#### Automatic Winner Calculation

- At the end of the tournament, a process determines the winning post based on the number of likes
- Handles potential ties
- Atomic execution to prevent inconsistencies
- If the winner of the previous week is banned, the system recalculates and displays the last valid winner

#### Winner Highlight (Last Week’s Winner)

- The winner is automatically showcased in the next tournament
- Highlighted through a dedicated “Last week’s winner” section

#### User Invitation System

- Users can invite others to join the tournament via messaging
- Sends targeted invitations to encourage participation
- Strengthens social interactions between users

#### Integration with the Notification System

- Automatic notifications are sent to the tournament winner
- Notifications sent to all participants (results, tournament end)

### Added Value to the Project

- **Enhanced Community Engagement:** The tournament creates a recurring event that encourages users to post, vote, and interact
- **Gamification of the User Experience:** Introduces a simple but effective competitive system (participate, win, get featured)
- **Stronger Social Dynamics:** With the invitation system, users actively bring others into the tournament, creating a network effect
- **Content Structuring:** Posts gain additional context and distinction between regular posts and tournament entries
- **User Recognition and Visibility:** Winners gain increased visibility through the “Last week’s winner” system, reinforcing social recognition
- **Enhanced User History:** Participations and wins can be displayed on user profiles, strengthening identity and progression
