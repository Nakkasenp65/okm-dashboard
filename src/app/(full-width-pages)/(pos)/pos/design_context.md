# POS Design Context & Constraints

## Target Device & Display
- **Resolution**: 1600 x 900 pixels (Primary production environment).
- **Target User**: Elderly users.

## Design Requirements
1.  **Font Size**: Must be larger than standard. Avoid small text (xs, sm) for critical information. Use `text-lg`, `text-xl` or larger where possible.
2.  **Spacing**: UI elements should not be crowded. ample padding and margin.
3.  **Accessibility**: High contrast and clear visual hierarchy.

## Specific Component Notes
-   **SellingList / SellingListItem**: Needs to be spacious.
-   **ProductDisplay**: Show `availablequantity` as the stock indicator.
