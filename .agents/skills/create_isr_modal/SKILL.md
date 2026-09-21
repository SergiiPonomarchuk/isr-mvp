---
name: "Create ISR Modal"
description: "Triggers when adding a new modal, popup, dialog, or UI element to the ISR application."
---

# Create ISR Modal / UI Element

When building or modifying UI elements, modals, or popups for the ISR MVP, you MUST follow these strict guidelines. Do NOT use React, Vue, Tailwind, or Material UI. The project is strictly Vanilla JS and CSS.

## 1. Modals and Dialog Overlays
- All section navigation opens content inside the single `#section-modal-overlay` / `#section-modal-body` / `#section-modal-title`.
- For standard dialogs (like confirmations), use:
  - Overlay: `.YOUR-modal-overlay` (CSS: `background: rgba(15, 23, 42, 0.45)`, `backdrop-filter: blur(4px)`)
  - Dialog Box: `.YOUR-modal-dialog` (CSS: `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-xl)`)
- Close buttons must be unified 36px diameter circles with a centered `✕` character. Use classes: `.YOUR-modal-close` or `.YOUR-modal-close-btn`.
- Modal titles must use `.YOUR-modal-title` (CSS: `font-size: 1.2rem`, `font-weight: 700`, `color: var(--text)`).

## 2. Buttons
- Always use capsule styling (`border-radius: 999px`).
- Primary Action: `background: var(--primary)` with `#fff` text.
- Secondary Action: `background: var(--surface-soft)` with `border: 1px solid var(--border)` and text `var(--text)`.

## 3. Form Inputs
- Standard styling overrides apply to `input[type="text"]`, `input[type="password"]`, `input[type="number"]`, `input[list]`, `select`. 
- Do not create new input styles. Use existing base styles.

## 4. Fonts and Colors
- Do not add a second font family. `Inter` is the only font.
- Do not hardcode colors that duplicate existing CSS variables (e.g., use `var(--text)`, `var(--primary)`).
