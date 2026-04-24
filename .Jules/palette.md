## 2024-04-22 - Added aria-labels to icon-only chat buttons
**Learning:** Found several icon-only buttons in the chat components lacking aria-labels, making them inaccessible to screen readers.
**Action:** Always add aria-labels to icon-only buttons, specifically in chat actions menus, emoji pickers, and reference pickers. Use i18n translation keys whenever possible for localized accessibility.
## 2023-10-27 - Added missing ARIA labels to Wiki Chat components
**Learning:** Icon-only buttons for critical actions like closing a modal/drawer or sending a message often lack ARIA labels, making them inaccessible to screen readers.
**Action:** Always scan for `<button>` elements containing only an icon (e.g., `<X />`, `<Send />`) and ensure they have an `aria-label` or `title` describing their action.
