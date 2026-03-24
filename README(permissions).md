## Advanced Permissions System (2pts)

- **Implementation**: Role-based CRUD system with Admin, Moderator, and User tiers
- **Features**:
  - View, edit, and delete users (CRUD operations)
  - Role management (admin, moderator, user)
  - Different views and actions based on user role
  - Granular permission controls
  - Role-based API endpoint access

---

### Custom Module: Advanced Moderation & Escalation System (2pts)

#### Justification
Originally planned as a basic "Advanced Permissions System" (CRUD operations + role-based access), this module has been significantly expanded into a **comprehensive community moderation and escalation framework** that substantially exceeds the original scope.

#### Technical Complexity

This module demonstrates advanced technical complexity across multiple domains:

1. **Stateful Escalation Logic**:
   - Multiple reports on the same user/post are aggregated
   - Automatic escalation thresholds trigger administrative actions
   - State transitions (PENDING → ASSIGNED → ACCEPTED → RESOLVED) with audit trails
   - Rollback mechanisms for rejected reports

2. **Report Aggregation Engine**:
   - Complex queries to group reports by target user/post
   - Weighted scoring based on report type and reporter credibility
   - Duplicate detection to prevent report spam
   - Real-time counter updates

3. **Ticket Workflow System**:
   - Multi-step workflow (creation, assignment, review, resolution)
   - Assignment logic with moderator availability
   - Context preservation across ticket lifecycle
   - Integration with moderation logs for accountability

4. **Ban Management**:
   - User soft-delete via `bannedAt` timestamp
   - Authentication blocked: Banned users cannot log in (login endpoint returns 403)
   - API requests blocked: All endpoints check `bannedAt` before processing
   - Soft-delete: User data preserved in database for audit trail and potential appeal
   - Unban functionality with date restoration
   - Cascading effects (banning a user affects their posts, messages, etc.)
   - Ban reason tracking and admin review capability
   - Audit trail preserved: Original ban reason/moderator still logged for transparency

5. **Email Notification System**:
   - Templated email generation for:
     - Ticket assignments to moderators
     - Report resolutions to users
     - Ban notifications
     - Appeal notifications
   - SMTP integration with Nodemailer
   - Retry logic for failed email deliveries
   - Rate limiting to prevent email spam

6. **Comprehensive Audit Logging**:
   - Every moderation action creates immutable logs
   - Tracks WHO performed action, WHEN, WHAT changed, WHY
   - Links logs to reports, tickets, and affected users
   - Enables complete accountability and dispute resolution

7. **Visual Role Badges**: Distinctive badges/icons displayed next to usernames
    - Badge for Admins
    - Badge for Moderators
    - Clear visual distinction for user trust and accountability

#### What Value Does It Add?

1. **Team Safety & Trust**: Automated report handling prevents abusive content from damaging the community
2. **Scalability**: System can handle thousands of users without manual moderation bottlenecks
3. **Fairness & Appeal**: Comprehensive logging allows users to understand moderation decisions
4. **Operational Efficiency**: Workflow automation reduces moderator workload
5. **Data-Driven Decisions**: Analytics on report types, ban patterns, and escalation trends

#### Why This Qualifies as Major (2pts)

- **Substantial Code**: 1000+ lines of business logic across services, controllers, guards
- **Architectural Complexity**: Multi-layered system with aggregation, workflow, notification layers
- **Technical Depth**: Database optimization, email integration, real-time permissions
- **Real-world Value**: Essential for any community platform with safety requirements
- **Non-trivial**: Cannot be described as "just storing more fields" — involves complex state transitions and business logic
- **Demonstrable Skill**: Requires understanding of escalation logic, event-driven architecture, audit trails

---
