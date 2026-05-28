<div align="center">

# Matcha

> *Because love, too, can be industrialized.*

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

</div>

---

## About

A full-stack dating web application built as part of the 42 Network curriculum. Covers the entire user journey from registration to real-time chat, with a smart matching algorithm based on location, shared interests, and fame rating.

---

## Features

### Authentication
- Registration with email verification via unique link
- Secure login with password reset flow
- One-click logout from any page

### User profile
- Gender, sexual preferences, biography, interest tags
- Up to 5 photos with a designated profile picture
- Profile view history and likes received
- Public fame rating
- GPS location (with consent) or manual city/neighborhood entry

### Matching & browsing
- Smart suggestions based on proximity, shared tags, and fame rating
- Sortable and filterable by age, location, fame rating, and tags
- Handles straight, gay, and bisexual preferences

### Advanced search
- Filter by age range, fame rating, location, and interest tags
- Sortable results

### Profile interaction
- Like / unlike profiles
- Mutual like = connected → chat unlocked
- View online status and last connection time
- Report fake accounts
- Block users (removes from search, disables chat and notifications)

### Real-time chat
- Chat available for mutually connected users
- New message indicator visible from any page
- Max 10 second delay

### Notifications
- Real-time alerts (max 10 second delay) for:
  - Received likes
  - Profile views
  - New messages
  - Mutual match
  - Disconnection (unlike)
- Unread notification indicator visible from any page

---

## Security
- Passwords hashed — never stored in plain text
- Protection against SQL injection
- Input validation on all forms
- File upload restrictions
- Credentials stored in `.env` — never committed to Git

---

## Getting started

```bash
# Clone the repo
git clone https://github.com/otelliq/<repo-name>
cd <repo-name>

# Set up environment variables
cp .env.example .env
# Fill in your DB credentials, mail config, etc.

# Install dependencies
npm install

# Set up the database
# (run your SQL schema files)

# Start the server
npm start
```

---

## Environment variables

```
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
SESSION_SECRET=
```

---

<div align="center">

42 Network project — built by [Othmane Elliq](https://github.com/otelliq)

</div>
