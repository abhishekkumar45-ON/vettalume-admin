# Vettalume — Admin Console (React + Vite)

The admin frontend for the Vettalume adaptive exam-prep platform (CAT / GMAT / GRE).
This is the structured, componentised version of the single-file prototype — same design
system, same features, organised so it can be wired to a real backend.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

Build / preview a production bundle:

```bash
npm run build
npm run preview
```

## Demo sign-in

```
email:    admin@vettalume.com
password: admin123
```

> The login gate is front-end only. Replace `A.login` in `src/store.jsx` with a real
> auth call before deploying.

## What's inside

- **Students** — accounts, enrollments, verification, payment status, filters, detail + edit.
- **Payments** — transaction status, revenue stats, access-level control, auto-verify banner.
- **Coupons** — create discount codes (percentage / fixed), usage limits, course & attempt
  restrictions, validity window; activate / deactivate / edit / delete.
- **Courses** — CAT / GMAT / GRE catalog cards.
- **Learning** — chapters → subtopics → content tabs (concept rich-text, videos, materials,
  quiz). Quiz supports per-question editing and **bulk .xlsx import** (SheetJS).
- **Sectional & Full mocks** — section-based papers, per-section question banks, bulk import,
  publish/unpublish, and **attempt analytics** (who attempted, score, accuracy, section-wise
  report) for both mock types.
- **Settings** — platform/admin config + **automatic account verification after payment** toggle.
- **GMAT adaptive** — for GMAT, mock questions upload in any order; the UI hides manual
  ordering and marks items "served dynamically" (the engine serves the next item by difficulty).

## Project structure

```
src/
  main.jsx            entry
  App.jsx             auth gate, layout, topbar, view router, modal + toast mount, xlsx bridge
  Sidebar.jsx         brand, exam switcher, nav, admin chip
  index.css           full design system (cool-stone + gold) — design tokens & components
  helpers.js          pure utils + domain constants (EXC, SECS, labels, accessLevel, …)
  icons.jsx           inline-SVG icon set
  ui.jsx              Btn, Field, Pill, Modal, Toasts, charts, RichText, QuestionRow, …
  store.jsx           single source of truth: seed data, external store (useSyncExternalStore),
                      selectors, and ALL mutations in the action object `A`
  excel.js            .xlsx parse + question template (SheetJS)
  modals.jsx          every dialog (student, enroll, chapter, subtopic, media, question,
                      mock config, section config, coupon, import preview, attempt report)
  pages/
    Misc.jsx          Dashboard, Courses, Reports, Settings
    People.jsx        Students, Payments
    Coupons.jsx       Coupons
    Learning.jsx      chapters / subtopics / content
    Mocks.jsx         Sectional, Full, shared MockEditor, MockResults
```

## State & wiring to a backend

All data lives in memory in `src/store.jsx` and resets on reload. The store is a tiny
external store (`useSyncExternalStore`); components read it via `useStore()` and mutate it by
calling methods on the exported `A` object. To connect a backend, replace the bodies of those
`A` methods with API calls (and hydrate `initialState` from your API on load). The component
layer doesn't need to change.

Charts are dependency-free inline SVG. Excel import/export uses `xlsx` (SheetJS).
