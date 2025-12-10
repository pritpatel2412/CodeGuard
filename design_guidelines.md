# AI PR Reviewer System - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Developer Tool Pattern
**References:** Linear (interaction patterns), GitHub (code review UX), Vercel (dashboard aesthetics)
**Rationale:** This is a utility-focused, information-dense developer productivity tool requiring clarity, efficiency, and fast information scanning.

## Core Design Principles

1. **Information Clarity:** Prioritize scannable content over visual flourish
2. **Functional Hierarchy:** Use typography and spacing to guide attention, not decoration
3. **Technical Precision:** Design reflects the precision expected in code reviews
4. **Minimal Cognitive Load:** Clean layouts that don't compete with complex technical content

---

## Typography System

### Font Families
- **Primary (UI):** Inter (Google Fonts) - weights 400, 500, 600
- **Monospace (Code):** JetBrains Mono (Google Fonts) - weights 400, 500

### Type Scale
- **Page Titles:** text-2xl font-semibold (Inter 600, 24px)
- **Section Headers:** text-lg font-semibold (Inter 600, 18px)
- **Card Titles:** text-base font-medium (Inter 500, 16px)
- **Body Text:** text-sm (Inter 400, 14px)
- **Code/Technical:** text-sm font-mono (JetBrains Mono 400, 14px)
- **Labels/Meta:** text-xs (Inter 400, 12px)
- **Metrics/Stats:** text-3xl font-semibold (Inter 600, 30px)

---

## Layout System

**Spacing Units:** Use Tailwind units of **2, 4, 6, 8, 12, 16, 24** for consistency
- **Component padding:** p-4, p-6
- **Section spacing:** space-y-6, space-y-8
- **Card gaps:** gap-4, gap-6
- **Page margins:** mx-6, mx-8

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Sidebar: Fixed 240px width on desktop, collapsible on mobile
- Main content: max-w-7xl mx-auto px-6

---

## Component Library

### Navigation
**Sidebar (Desktop):**
- Fixed left sidebar, w-60
- Logo/branding at top (h-16)
- Navigation items with icon + label
- Active state: subtle background treatment
- Bottom section for user profile/settings

**Top Bar:**
- h-16 fixed header
- Repository selector dropdown (left)
- Search input (center, max-w-md)
- Notification bell + user avatar (right)

### Dashboard Layout
**Stats Overview (Top Section):**
- 4-column grid (grid-cols-4) on desktop, grid-cols-2 on mobile
- Each stat card: p-6, rounded-lg border
- Large number (text-3xl) + label (text-xs) + trend indicator

**Activity Feed (Main Content):**
- Two-column layout (grid-cols-3 gap-6)
- Left: Recent reviews list (col-span-2)
- Right: Summary panel (col-span-1)

### Review Cards
**PR Review Item:**
- p-6, rounded-lg, border, space-y-4
- Header: PR title (text-base font-medium) + repo badge + timestamp
- Risk badge: inline-flex px-2 py-1 text-xs rounded-full
- Meta row: author avatar + status + comment count
- Action buttons: View Details (primary), Dismiss (ghost)

### Code Review Display
**Diff Viewer:**
- Full-width container with max-w-5xl
- File headers: p-3, font-mono text-sm, border-b
- Line numbers: w-12, text-right, text-xs
- Code blocks: p-4, font-mono text-sm, preserve whitespace
- Comment threads: ml-12, p-4, border-l-2, space-y-2

**Review Comment Card:**
- p-4, rounded-md, border
- Header: Issue type badge + line number
- Body: text-sm, leading-relaxed
- Footer: Severity indicator + suggested fix toggle

### Tables
**Review History Table:**
- Full-width, border rounded-lg
- Headers: px-4 py-3, text-xs font-medium, border-b
- Rows: px-4 py-3, hover state, border-b
- Columns: PR Title, Repository, Risk Level, Comments, Date, Status
- Pagination: flex justify-between items-center px-4 py-3

### Forms
**Repository Setup:**
- max-w-2xl form container
- Input groups: space-y-6
- Labels: text-sm font-medium, mb-2
- Inputs: p-3, rounded-md, border, w-full
- Webhook URL display: font-mono, p-3, border, rounded-md (read-only)
- Helper text: text-xs, mt-1

### Badges & Status
**Risk Level Badges:**
- inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
- Include dot indicator (h-1.5 w-1.5 rounded-full mr-1.5)

**Issue Type Tags:**
- inline-flex px-2 py-1 rounded text-xs
- Types: Bug, Security, Performance, Maintainability, Readability

### Empty States
**No Reviews Yet:**
- Centered container py-16, max-w-md
- Icon (w-16 h-16)
- Heading (text-xl font-semibold)
- Description (text-sm, mt-2)
- CTA button (mt-6)

---

## Page Layouts

### Dashboard Page
- Stats overview (4 cards across)
- Recent activity feed (2/3 width) + Quick summary sidebar (1/3 width)
- Activity items show: PR title, repo, risk level, comment count, timestamp

### PR Review Detail Page
- Breadcrumb navigation (text-sm)
- PR header: title, author, timestamps, status
- Risk assessment panel
- Diff viewer with inline comments
- Comment summary sidebar (sticky)

### Settings Page
- Two-column: Sidebar navigation (w-48) + Content area (flex-1)
- Sections: Repository Configuration, Webhook Setup, Review Preferences, API Keys
- Form-heavy with save buttons per section

---

## Icons

**Library:** Heroicons (v2) via CDN
**Usage:**
- Navigation: outline style, w-5 h-5
- Buttons: outline/solid based on prominence, w-4 h-4
- Status indicators: solid style, w-3 h-3
- Empty states: outline style, w-16 h-16

---

## Animations

**Minimal Motion:**
- Hover transitions: transition-colors duration-150
- Loading states: Simple spinner or skeleton screens
- Page transitions: None (instant navigation)
- Dropdown/modal: fade in (transition-opacity duration-200)

**No auto-playing animations** - all motion is user-initiated.

---

## Responsive Behavior

**Mobile (< 768px):**
- Sidebar becomes slide-out drawer
- Stats grid becomes 1-column
- Tables become card stacks
- Hide secondary columns in tables

**Tablet (768px - 1024px):**
- Stats grid becomes 2-column
- Maintain sidebar visibility

**Desktop (> 1024px):**
- Full layout as designed
- Sticky sidebar and summary panels

---

## Images

**No hero images needed.** This is a dashboard application. Use:
- Empty state illustrations (simple line art)
- User avatars (rounded-full, w-8 h-8)
- Repository icons/favicons where applicable

All imagery should be functional, not decorative.