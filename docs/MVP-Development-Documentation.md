# ISR Vote MVP Development Documentation

This document serves as the guide for frontend design patterns, UI consistency, and guidelines for adding new features, pages, or modals to the ISR Vote MVP.

---

## 1. UI Reuse Principle

> [!IMPORTANT]
> **Core Guideline**: Each new modal or page must reuse existing UI elements if their functionality is sufficient for the task. Do not write custom inline styling or introduce new classes for elements like buttons, overlays, inputs, or standard dialogs unless absolutely necessary.

---

## 2. Core UI Design Patterns

### Modals and Dialog Overlays
To ensure a consistent look and feel across the dashboard, issue list modals, and configuration settings, all modals must adhere to the standard overlay and dialog classes:

*   **Overlay**: Modals should be wrapped in an overlay container using a class structured like `.YOUR-modal-overlay` with the following unified properties:
    *   `background: rgba(15, 23, 42, 0.45)` (Slate overlay)
    *   `backdrop-filter: blur(4px)` (Premium blurred background)
    *   `display: flex; justify-content: center; align-items: flex-start; padding: 40px 16px` (Unified scrollable wrapper)
*   **Dialog Card**: The inner modal dialog must use `.YOUR-modal-dialog` and inherit properties or share layout styling matching the standard modals:
    *   `background: var(--surface)`
    *   `border: 1px solid var(--border)`
    *   `border-radius: var(--radius-xl)` (18px)
    *   `box-shadow: var(--shadow-lg)`
    *   `padding: 24px`
*   **Close Button**: Standard modal close buttons must use standard classes (e.g., `.YOUR-modal-close` or `.YOUR-modal-close-btn`) and be identical:
    *   `36px` diameter circle
    *   Centered `✕` character
    *   Consistent border, hover transition (`background: var(--surface-soft)`), and outline style
*   **Titles**: Modal titles must use standard heading classes (`.YOUR-modal-title`) matching:
    *   `font-size: 1.2rem`
    *   `font-weight: 700`
    *   `color: var(--text)`
    *   `margin: 0 0 16px`

### Buttons
All buttons in the application should follow a unified capsule design pattern:

*   **Capsule styling**: Set `border-radius: 999px` to make all action, tour, login, register, and adoption buttons capsule-shaped.
*   **Paddings**:
    *   Small buttons (e.g., `.tour-btn`, `.profile-adopt-btn`): Use `padding: 6px 14px`.
    *   Standard/large buttons (e.g., form submissions): Use `padding: 10px 20px`.
*   **Colors**:
    *   **Primary Action**: Use `background: var(--primary)` with text `#fff` and hover transitions.
    *   **Secondary Action**: Use `background: var(--surface-soft)` with `border: 1px solid var(--border)` and text `var(--text)`.

### Form Inputs
All text, password, number, and list selection inputs must share the default style pattern defined in `prototype/styles.css`:

*   **Selector unification**: Standard styling overrides (`input[type="text"]`, `input[type="password"]`, `input[type="number"]`, `input[list]`, `select`) use unified padding (`10px 12px`), borders (`1px solid var(--border-strong)`), surface colors, and hover/focus rings (`box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.12)`).

---

## 3. Implementation Workflow for Modals
When implementing a new modal:
1.  Add the HTML structure inside the main layout file, using the standard overlay/dialog classes.
2.  Inherit or map standard CSS classes instead of declaring unique styling rules.
3.  Add close button triggers using JS handlers that bind to the standard `close` actions.
4.  Ensure visual similarity with existing dialogs by inspecting alignments, paddings, and button styles in developer tools.
