CODING GUIDELINES — PlanDojo Frontend

Purpose
- Keep the landing experience minimalist, spatial-first, and utility-driven.
- Enforce tokens, ARIA contracts, component state names, and hard guardrails described below.

Quick checklist for every change
- Reuse tokens in `app/globals.css` (see Tokens section).
- Follow component/state conventions (Accordion, CTA block).
- Run: `npm run build` and `npm run dev` locally; confirm no build errors.
- Do not push to `origin/main` without explicit approval from the product owner.

Design tokens (use these CSS variables)
```
:root {
  --color-cta: #2563eb; /* Primary CTA (Cobalt) */
  --color-bg: #fcf6e8;  /* Sand background */
  --color-text: #1e293b;/* Deep charcoal */
  --color-muted: #9CA3AF;/* Muted / secondary text */
  --color-accent: #6495ED;/* Accent if needed */
  --radius: 12px;
  --space-1: 8px; --space-2: 12px; --space-3: 16px;
}
```
- Do not alter these tokens without product approval.

Backdrop / Motion
- `.main` should use the hardware-accelerated blueprint grid with `background-attachment: fixed` only when: `@media (pointer: fine) and (prefers-reduced-motion: no-preference)`.
- Mobile and reduced-motion must fall back to `background-attachment: scroll`.

Component & state conventions (required)
- Accordion
  - State names: `activeTab` (string|null), `toggleTab(id:string)`.
  - Single-open behavior by default.
  - Render panel children lazily (only when expanded).
  - ARIA: container `role="tablist"`; header buttons `role="tab" aria-expanded="true|false" aria-controls="panel-<id>"`; panels `role="tabpanel" id="panel-<id>"`.
- CTA Action Block
  - Container class: `.actionCtaBlock`.
  - Button class: `.actionCtaButton` or reuse `.ctaButton` but ensure color `--color-cta`.
  - Button label must be: `APPROVE & DISPATCH PRO-BIDS` where used.
  - CTA must be keyboard-focusable and have visible focus outline.

Copy guardrails (HARD NOs)
- Never use: “leads”, “marketplace”, “traction”, “users”, “growth”, “total addressable market”, macro numeric market stats, or similar pitch-deck language.
- Use utility-first, action-oriented copy only: e.g. “Confirm measurements”, “Dispatch regional bids”, “Approve & dispatch pro-bids”.

Accessibility
- Always include ARIA on interactive widgets as specified above.
- Buttons must have discernible text; interactive panels must be reachable by keyboard.
- Respect `prefers-reduced-motion` — stop all non-essential animations.
- Verify color contrast for body text >= 4.5:1.

Performance & assets
- Lazy-load heavy assets and images with `loading="lazy"` and `srcset`.
- Keep initial DOM minimal; expand complexity on user interaction.
- No inline third-party analytics or tracking scripts; use approved, server-side logging or packaged analytics only.

Testing & verification
- Local build: `npm run build` — must succeed.
- Dev server: `npm run dev` — manual QA on desktop and mobile emulation.
- Optional: Lighthouse audit for LCP/accessibility.

Commit & PR policy
- One feature/fix per commit with a clear message.
- Don’t push to `origin/main` without explicit “ok to push.”
- PR description must include: files changed, tokens touched, accessibility checklist, build output summary.

Files to update when tokens/components change
- `app/globals.css` — tokens & component styles
- `design/figma-palette.md` — token definitions and usage notes
- Add short README or JSDoc in `design/` for any new interactive component explaining state names and ARIA contract.

Enforcement
- Before merging run: build + manual QA + accessibility checks.
- If a change reintroduces forbidden language or changes core tokens/backdrop rules, reject and request revision.

If you want, I can add a CI step to run `npm run build` and a spell-check/lint step to catch forbidden words automatically. To add the guideline file to the repo now, say “ok to commit guidelines”.
