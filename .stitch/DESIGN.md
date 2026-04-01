# Design System: App Ventas
**Project ID:** app-ventas-frontend
**Last Updated:** 2026-04-01

## 1. Visual Theme & Atmosphere
Minimalista, moderno y profesional con transiciones fluidas. La interfaz usa una paleta de colores sofisticada basada en Indigo/Purple (Primary) y Pink (Secondary), con énfasis en espacio en blanco, sombras suaves y gradientes sutiles.

## 2. Color Palette & Roles

### Primary Colors (Indigo)
| Name | Hex | Usage |
|------|-----|-------|
| Primary 50 | #EEF2FF | Backgrounds, subtle highlights |
| Primary 500 | #6366F1 | Primary buttons, active states |
| Primary 600 | #4F46E5 | Primary button hover |
| Primary 700 | #4338CA | Pressed states |

### Secondary Colors (Pink)
| Name | Hex | Usage |
|------|-----|-------|
| Secondary 500 | #EC4899 | Accents, badges |
| Secondary 600 | #DB2777 | Hover accents |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Emerald 500 | #10B981 | Success, positive values |
| Amber 500 | #F59E0B | Warnings, low stock |
| Red 500 | #EF4444 | Errors, danger, out of stock |
| Violet 500 | #8B5CF6 | Charts accent |

### Neutral Palette (Slate)
- Background: `#F8FAFC` (light) / `#0F172A` (dark)
- Surface: `#FFFFFF` (light) / `#1E293B` (dark)
- Border: `#E2E8F0` (light) / `#334155` (dark)
- Text Primary: `#1E293B` (light) / `#F1F5F9` (dark)
- Text Secondary: `#64748B` (light) / `#94A3B8` (dark)

## 3. Typography
- **Font:** Inter (Google Fonts)
- **Headings:** font-semibold, tracking-tight
- **Body:** text-sm, font-normal
- **Labels:** text-xs, font-medium

## 4. Component Stylings

### Cards
- Background: `bg-white dark:bg-slate-800`
- Border: `border border-slate-200/50 dark:border-slate-700/50`
- Border-radius: `rounded-2xl`
- Shadow: `shadow-card` → `shadow-card-hover` on hover

### Buttons
- Primary: `btn-primary` - Indigo background, white text, shadow-glow
- Secondary: `btn-secondary` - Outlined, subtle background on hover

### Inputs
- Border-radius: `rounded-xl`
- Focus: `focus:ring-2 focus:ring-primary-500/20`

### Badges
- Rounded-full with semantic colors (success/warning/danger/neutral)

## 5. Animations
- `animate-fade-in` - Page load
- `animate-slide-up` - Staggered card entry
- `animate-scale-in` - Modals
- `animate-slide-in` - Notifications, sidebar
- `active:scale-95` - Button press feedback

## 6. Screen Inventory
| Screen | Status | Features |
|--------|--------|----------|
| Login | ✅ Updated | Gradient background, glass effects, animated form |
| Dashboard | ✅ Updated | Stats cards with icons, gradient actions, modern charts |
| Products | ✅ Updated | Modern table, badges, modal with animations |
| Sales | ✅ Updated | Sticky cart, gradient buttons, notification toasts |
| SalesHistory | ✅ Updated | Collapsible cards, search, improved empty states |