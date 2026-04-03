# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MentaTrack is a Progressive Web App (PWA) for scientific research at Odion (disability care organization). It measures whether caregivers (begeleiders) improve their mentalization skills through an app-based intervention over 15-20 weeks. All data is stored locally and encrypted (AES-GCM) — no backend.

## Tech Stack

- Vanilla JavaScript (ES6+, IIFE module pattern)
- HTML5 + CSS3 (no framework, no build step)
- IndexedDB with Web Crypto API encryption
- Service Worker for offline-first
- Google Fonts: Montserrat

## Architecture

```
index.html          — Single page with all views (hidden/shown via JS)
css/style.css       — All styling, Odion brand colors (#6A167A purple primary)
js/crypto.js        — AES-GCM encryption (CryptoModule)
js/db.js            — IndexedDB wrapper (DB) — 5 stores: questionnaires, storyResults, observations, settings, schedule
js/stories.js       — 10 case stories for mentalization task (StoriesModule)
js/export.js        — CSV export (ExportModule)
js/app.js           — Main application logic (App) — navigation, role management, all UI logic
sw.js               — Service Worker, cache-first strategy
assets/             — Odion logo (SVG/PNG), 36 vormelementen PNGs, brand PDF
```

## Key Patterns

- All modules use IIFE pattern: `const Module = (() => { ... return { publicAPI }; })()`
- Data flow: App.js → DB.js → CryptoModule.js → IndexedDB
- Views are `<main>` elements toggled with `.hidden` class
- Two roles: `deelnemer` (caregiver) and `admin` (researcher) — stored in DB settings
- Stories use open text answers scored 0-1-2 by keyword matching (auto) + manual researcher override

## Odion Brand Identity

Use the skill at `.claude/skills/odion-huisstijl/SKILL.md` for brand guidelines. Key colors:
- `--odion-paars: #6A167A` (primary)
- `--odion-rood: #EA5045` (accent)
- `--odion-donkerrood: #B33556` (secondary)
- `--odion-geel: #FFFF64` (highlight, use sparingly)
- White backgrounds always

## Development

No build step. Open `index.html` in a browser or serve with any static server. Update `sw.js` CACHE_NAME version when changing files to bust the cache.

## Language

All UI text is in Dutch. Target audience: begeleiders (caregivers) in gehandicaptenzorg (disability care). Client names in stories: Veerle, Rick, Cor, Meike, Roger.
