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
