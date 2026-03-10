# Tier List Maker - Design Document

**Date**: 2026-03-02
**Status**: Validated
**Author**: Antigravity

## 🎯 Overview
A premium, highly interactive Tier List Maker built for Vercel. Features include advanced drag-and-drop, category customization, local image uploads, custom image-with-text generation, Deezer music card integration, and PNG export.

## 🏗️ Architecture
- **Framework**: Next.js 15 (App Router) + TypeScript.
- **Styling**: Tailwind CSS (Bento Grid + Neumorphism design system).
- **Interactive**: `@dnd-kit` for drag-and-drop between lists and internal sorting.
- **State**: Zustand with `persist` middleware for automatic local saving (localStorage).
- **Music API**: Deezer API for track search and metadata fetching.
- **Export**: `html-to-image` for high-quality PNG generation.

## 🎨 UI Components (Bento Style)
1.  **Sidebar / Control Bento**:
    - **Category Management**: Add, Rename, Delete, Color Change.
    - **Deezer Search**: Real-time search with visual results card generation.
    - **Image Builder**: Local file upload + basic canvas for text-on-image assets.
2.  **Tier Board**:
    - **Droppable Rows**: Customizable headers and item slots with Neumorphic depth.
    - **Draggable Cards**: Smooth animations and layout stability during movement.
3.  **Action Bento**:
    - Export PNG, Reset Board, and Load Save buttons.

## 💿 Data & Persistence
- **State Model**: 
  - `categories`: Array of `{ id, name, color, items: Item[] }`.
  - `Item`: `{ id, type: 'image' | 'music' | 'custom', url, metadata? }`.
- **Auto-Save**: Automatic sync to `localStorage` on every state change.
- **Recovery**: Automatic hydration of store on application mount.

## 🧪 Testing & Error Handling
- **TDD Approach**: Unit tests for sorting logic and state transitions.
- **Fallbacks**: Error boundaries for API failures (Deezer) and image loading issues.
- **Validation**: Zod schema validation for stored data to prevent corruption.
