# Cantera

A talent platform for esports. Players build a profile, find teams and roles, apply, and talk to recruiters.

"Cantera" is Spanish for a club's youth academy, the place where new talent comes from.

**[Try the demo](https://cantera.fsucatti-portfolio.workers.dev)**

![Cantera's home screen, with job matches and a community feed](docs/cantera.webp)

Design by **Julian Sucatti**. Built by **Francisco Sucatti**.

Every team, game and character in the app is invented. Game pictures are AI-generated. Characters use stock photos, with [credits here](docs/IMAGE-CREDITS.md): the people photographed have no connection to this project.

## Getting started

On the login screen, click **Try it as a guest**. You get a sample player profile, with no email needed. It's deleted after 7 days.

Then try this path:

1. On the home screen, check **Your Newest matches**, ranked by how well your skills fit each role.
2. Open a match and click **Apply for this position**.
3. The recruiter writes to you in the **Inbox**. Answer them: replies are written by AI, in your language.
4. Go to your profile, in the bottom left, and change your skills. Your matches change too.

## What you can do

| Area | Features |
|---|---|
| **Home** | Job matches, your applications, teams to follow, and a community feed |
| **Jobs Board** | Search, filters by type, saved listings, and full role descriptions |
| **Applications** | Apply with a note, withdraw, and get a message from the recruiter |
| **Teams** | Team pages with open roles, and following |
| **People** | Fictional coaches, recruiters and creators you can message |
| **Inbox** | Conversations with unread counts and notifications |
| **Profile** | Avatar, background, skills, work history, awards, highlights and linked accounts |
| **Account** | Sign up, log in, change your password, or delete your account |

Your posts and messages are private: other visitors don't see them.

## Built with

React, TypeScript, React Router, Hono, Vite, Cloudflare Workers, D1 and Workers AI.

## Run it locally

You need Node.js 22 or later and a free Cloudflare account, which gives access to the models.

```bash
npm install
```

```bash
npx wrangler login
```

```bash
npm run preview
```

Then open <http://localhost:8788>. The database is a local file, and AI replies count against your account's daily allowance.

| Command | What it does |
|---|---|
| `npm test` | Runs the tests |
| `npm run test:e2e` | Tests the whole app in the browser. On Windows it uses Microsoft Edge, and it sends a few real AI requests |
