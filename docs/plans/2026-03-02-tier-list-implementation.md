# Tier List Maker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a premium Tier List Maker with Bento/Neumorphic design, featuring drag-and-drop, category management, Deezer integration, and PNG export.

**Architecture:** Next.js 15 App Router with Zustand for state and @dnd-kit for interactivity.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Zustand, @dnd-kit, html-to-image, Framer Motion.

---

### Task 1: Project Initialization
**Files:**
- Create: `./` (Root)
- Test: Check if `package.json` exists.

**Steps:**
1. Run: `npx -y create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git`
2. Expected: Project initialized with Next.js 15.

### Task 2: Dependency Installation
**Files:**
- Modify: `package.json`

**Steps:**
1. Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers zustand lucide-react framer-motion html-to-image clsx tailwind-merge`
2. Run: `npm install -D @types/node @types/react @types/react-dom`

### Task 3: Design System Setup (Neumorphism & Bento)
**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Steps:**
1. Update `tailwind.config.ts` with neomorphic shadow utilities and Bento grid spacing.
2. Define core color tokens (Soft Grey, Deep Slate).

### Task 4: Store Implementation (State & Persistence)
**Files:**
- Create: `src/store/useTierStore.ts`

**Steps:**
1. Define `TierItem` and `Category` types.
2. Implement Zustand store with `persist` middleware.
3. Add actions: `addCategory`, `removeCategory`, `updateCategory`, `addItem`, `moveItem`.

### Task 5: Main Layout & Bento Structure
**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

**Steps:**
1. Set up the Google Font (Outfit).
2. Create the main Bento grid container (Sidebar vs. Tier Board).

### Task 6: Tier Row & Draggable Item Components
**Files:**
- Create: `src/components/TierRow.tsx`
- Create: `src/components/DraggableItem.tsx`

**Steps:**
1. Implement the `SortableContext` for rows.
2. Create the visual card for items with Neumorphic hover effects.

### Task 7: Drag & Drop Integration
**Files:**
- Modify: `src/app/page.tsx`

**Steps:**
1. Wrap the board in `DndContext`.
2. Implement `handleDragEnd` and `handleDragOver` to manage cross-category movement.

### Task 8: Category Management UI
**Files:**
- Create: `src/components/CategorySettings.tsx`

**Steps:**
1. Add inputs for renaming and color picking.
2. Hook up buttons to Zustand actions.

### Task 9: Deezer Music Search 
**Files:**
- Create: `src/lib/deezer.ts` (API service)
- Create: `src/components/MusicSearch.tsx`

**Steps:**
1. Implement track search using `fetch` (JSONP approach if needed for CORS or server-side proxy).
2. Render search results as "Ready to Drop" cards.

### Task 10: Custom Image Generator
**Files:**
- Create: `src/components/ImageBuilder.tsx`

**Steps:**
1. Create image upload handler.
2. Use a simple overlay for text customization (font, size, color, position).
3. Generate a base64 preview for the Tier Item.

### Task 11: Export & Final Polish
**Files:**
- Create: `src/components/ExportButton.tsx`
- Modify: `src/app/page.tsx`

**Steps:**
1. Implement `html-to-image` snapshot of the board.
2. Add smooth Framer Motion transitions for adding/deleting items.
