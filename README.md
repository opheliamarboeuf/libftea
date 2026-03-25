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

## Resources

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