# Elevation System (e0–e3)

Purpose: provide a semantic, minimal depth scale optimized for a calm, content-first UI without noisy shadow stacking.

## Scale
| Token | Intended Usage | Visual Treatment |
|-------|----------------|------------------|
| e0 | Layout grouping / inline sections inside a higher context (background panels, nested regions) | Base surface background, no border or shadow (may rely on parent padding) |
| e1 | Standard card / list item container / secondary panel | Surface background + subtle border (role-border) |
| e2 | Featured card, primary panel, emphasized module | Surface + border + light elevation shadow (elevation-1) |
| e3 | Overlay surfaces: popover, dropdown, dialog, modal sheets | Surface + border + stronger composite shadow (elevation-2) |

## Interaction Guidelines
- Hover (interactive surfaces at e1–e2): elevate one step visually via `hover:shadow-md` (does not change semantic token).
- Focus (keyboard / focus-visible): add ring using `focus-within:ring-[var(--color-focus-ring)]` while keeping hover elevation.
- Active/Pressed: micro-tactile feedback by slightly decreasing elevation and translating by 1px: `active:shadow-sm active:translate-y-[1px]`.

This preserves hierarchy (semantic elevation token unchanged) while giving responsive feel.

## Usage in Code
```tsx
<Surface elevation={1}>Card</Surface>
<Surface elevation={2} interactive>Primary Panel</Surface>
<Surface elevation={3} className="animate-overlay-enter">Dialog Content</Surface>
```

## Overlay Motion
- Appear: `.animate-overlay-enter` (fade + 4px upward lift) 180ms cubic-bezier(.4,.1,.2,1)
- Reduced Motion: falls back to simple fade-in.
- Dismiss: (recommended) apply reverse animation (optional future utility) or rely on opacity transition if framework handles unmount.

## Do / Avoid
- Do use the lowest elevation that communicates separation.
- Avoid stacking multiple nested shadows; prefer bumping border emphasis or spacing.
- Avoid using elevation for emphasis when color, typography, or layout spacing solves it more cleanly.

## Future Considerations
- Potential addition of e4 (fullscreen modal / highest layer) if app complexity grows.
- Tokenizing shadow recipes as CSS variables for theming (e.g., `--shadow-e2`).
