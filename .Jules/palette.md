## 2024-04-25 - Added ARIA labels to icon-only buttons in Wiki Chat
**Learning:** Found several icon-only buttons (`Close`, `Expand`, `Send`) in the WikiChat components lacking `aria-label`s, which makes them inaccessible to screen readers. This highlights a pattern where icon-only action buttons may miss explicit accessibility labels even if they have text adjacent or implied context.
**Action:** When adding new icon buttons, always verify `aria-label` attributes are present. We should proactively audit other icon-only interactive elements across the application.
