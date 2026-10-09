# Orbit

Orbit is an AI-powered social media automation platform that provides a single workspace for creating, managing, and publishing content across multiple social platforms.

## Features

* **Multi-Platform Publishing** — Connect X (Twitter) and Instagram accounts and publish content from a unified dashboard.
* **AI Content Generation** — Generate images and videos directly within the platform using integrated AI services.
* **Media Management** — Upload, preview, and manage images and videos before publishing.
* **Secure Authentication** — Google OAuth-based authentication with protected user sessions and secure social account linking.
* **Cloud Storage** — Automatically store AI-generated and uploaded media using AWS S3.
* **Activity & Engagement** — View recently published content and basic post engagement information.
* **Responsive Dashboard** — Designed for seamless use across desktop and mobile devices.

## Architecture & Tech Stack

**Backend:** Node.js, Express.js
**Database & Services:** Supabase
**Cloud Storage:** AWS S3
**AI:** OpenAI APIs
**Authentication:** Google OAuth, X OAuth, Instagram Authentication
**Integrations:** X and Instagram APIs

## Security

Social-Genie incorporates several safeguards for production-oriented usage, including protected sessions, upload validation, rate limiting, and controlled third-party account authorization.

## Use Case

The platform is designed for creators, small teams, and businesses that want to streamline social media operations without switching between multiple platforms. Social-Genie combines content creation, AI-powered media generation, storage, and publishing into a single workflow.
