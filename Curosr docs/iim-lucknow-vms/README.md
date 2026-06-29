# IIM Lucknow Visitor Management System — Prototype

A click-through visual prototype for the IIM Lucknow VMS capstone project. No backend, no authentication — all state lives in the browser session.

## Run locally

From this directory:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

> **Note:** ES modules require a local server — opening `index.html` directly from the filesystem may not work in all browsers.

## Demo flow

1. **Coordinator** — Pre-register a batch of recruiters (placement week scenario).
2. **Security** — See today's expected visitors (navy **Expected** badge), check them in (green **Checked In**), or log a **Walk-in** (orange badge).
3. **Admin** — Search and filter the full visitor log by date, type, and status.

Use the **Viewing as** dropdown in the header to switch roles without logging in.

## PRD alignment

- Visitor types: only IN SCOPE + PARTIAL rows from PRD §2.1 (Recruiter, Guest Faculty, Parent/Family, Vendor single-day).
- Explicitly excluded: delivery personnel, alumni, prospective students, emergency visitors, QR codes, notifications, auth, facial recognition.

## Sample data

Seeded on load: 5 pre-registered visitors (recruiters, guest faculty, parent) plus 2 walk-in entries from earlier today.
