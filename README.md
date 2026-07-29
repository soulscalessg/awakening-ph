# Awakening PH

The public website and registration experience for Awakening PH, built with
Next.js, vinext, and Cloudflare Workers.

## Prerequisites

- Node.js `>=22.13.0`
- npm

## Local development

```bash
npm install
npm run dev
```

The main routes are:

- `/` — campaign home page
- `/latest-schedules` — session schedule
- `/registration` — four-step ticket and payment flow
- `/be-part-of-awakening` — community participation page
- `/awakening-for-organizations` — organization access page
- `/login` — account sign-in
- `/platform` — signed-in operations workspace recreated from the supplied references

The platform workspace includes contacts, documents, photo galleries, sales
insights, CRM, registration management, seminar schedules, and application
tracking. New records and filters are interactive in the browser; this version
keeps those demonstration records in the current session.

## Verification

```bash
npm run build
npm test
npm run lint
```

`npm test` creates the production worker build and verifies the server-rendered
content for every public route.

## Project structure

- `app/` contains the routes, shared application component, and styles.
- `public/awakening/` contains campaign images, partner marks, and payment QR
  images.
- `worker/` contains the Cloudflare Worker entry point.
- `tests/` contains server-rendering checks for the built site.
- `.openai/hosting.json` links the source to its Sites project.

The current registration flow is client-side only. Before accepting real
registrations or payments, connect it to durable storage and server-side
validation.
