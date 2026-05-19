Figma Palette — PlanDojo

Colors (hex):

- Primary: #4169A6 — Use for main CTAs, links, brand accents
- Accent:  #6495ED — Use for secondary CTAs, highlights
- Background: #FAF8F3 — Page background and large panels
- Muted:   #9CA3AF — Labels, secondary text, borders
- Success: #4CAF50 — Success states and badges
- Danger:  #F44336 — Errors and destructive actions

Gradients (optional):
- Primary gradient: linear-gradient(135deg, #4169A6 0%, #6495ED 100%)
- Soft warm: linear-gradient(135deg, #FFF5EB 0%, #FAF8F3 100%)

Figma import tips:
1. Open your Figma file, create a new Frame.
2. Use the rectangle tool to draw color swatches, paste the hex codes above.
3. Add styles: select a swatch -> Fill -> Create style. Name styles: `Brand/Primary`, `Brand/Accent`, `Neutral/Background`, `Text/Muted`, `Status/Success`, `Status/Danger`.
4. Create a gradient fill in Figma using the two gradient hexes for CTAs.

CSS variables (copy into `app/globals.css`):

:root {
  --color-primary: #4169A6;
  --color-accent:  #6495ED;
  --color-bg:      #FAF8F3;
  --color-muted:   #9CA3AF;
  --color-success: #4CAF50;
  --color-danger:  #F44336;
  --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
}

Usage guidance:
- Keep the hero CTA on `--color-primary` with white text and subtle shadow.
- Use `--color-accent` for hover states and secondary controls.
- Use `--color-bg` as the large-section background; keep cards white or slightly off-white for contrast.
- Reserve `--color-danger` and `--color-success` for status only; avoid using them for primary CTAs.

If you'd like, I can:
- Apply these tokens directly into `app/globals.css` and update the hero/button styles.
- Generate a Figma file (Figma JSON) you can import, or a downloadable `.fig` export (requires account).