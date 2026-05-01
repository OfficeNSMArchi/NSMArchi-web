# Component Extraction Architecture

To integrate the "World Zoom" logic seamlessly into the production application, we must decouple the complex animation states from the specific UI of the `ProjectCard` and the main `page.tsx`.

We will create a generic "Zoom System" consisting of three components:

## 1. `components/zoom-provider.tsx` (or `ZoomContainer`)
A wrapper component that holds the global state for the zoom animation.
- **State**: `selectedElement`, `isZoomed`, `isModalOpen`.
- **Logic**: Contains `getContainerStyle`, `handleCardClick`, `handleCloseModal`, and the scroll-lock `useEffect`.
- **Render**: Wraps its children in the `div` that receives the `transform` styles. Renders the `ZoomModal` alongside the children when active.

*Wait*, if it wraps the children, how does the modal break out? The modal is `position: fixed`, so it will overlay perfectly even if rendered inside the scaled container? NO!
If the modal is rendered *inside* the container that is being scaled by `transform: scale()`, the `position: fixed` modal will ALSO BE SCALED. CSS transforms create a new containing block for `fixed` elements.

**CRITICAL DISCOVERY**:
In `app/zoom-test/page.tsx`, the Modal is rendered **OUTSIDE** the `<div ref={containerRef} style={getContainerStyle()}>`.
```tsx
return (
  <div>
    <div style={getContainerStyle()}> ... </div>
    {selectedProject && <Modal />}
  </div>
)
```
This means our "Zoom System" cannot just wrap the `children` and throw a modal inside. It must sit at a level where it can render the scaled container AND the unscaled modal side-by-side.

### Component Design: `ZoomLayout`

```tsx
// components/zoom-layout.tsx
"use client"
import React, { createContext, useContext, useState, ... } from 'react';

// 1. Context to allow cards to trigger the zoom
interface ZoomContextType {
  zoomTo: (data: any, rect: DOMRect) => void;
  closeZoom: () => void;
}
export const ZoomContext = createContext<ZoomContextType | null>(null);

// 2. The Layout Wrapper
export const ZoomLayout = ({ children, renderModal }: { children: React.ReactNode, renderModal: (data: any, onClose: () => void) => React.ReactNode }) => {
  // ... state ...
  // ... style calculation ...
  
  return (
    <ZoomContext.Provider value={{ zoomTo, closeZoom }}>
      {/* Scaled Background */}
      <div style={getContainerStyle()}>
        {children}
      </div>
      
      {/* Unscaled Overlay Modal */}
      {selectedData && renderModal(selectedData, closeZoom)}
    </ZoomContext.Provider>
  )
}
```

## 2. `components/zoom-trigger.tsx` (or update `ProjectCard`)
The existing `ProjectCard` in production can simply consume the `ZoomContext`.
```tsx
const { zoomTo } = useContext(ZoomContext);
const ref = useRef();

const handleClick = () => {
  zoomTo(projectData, ref.current.getBoundingClientRect());
}
```

## 3. `components/zoom-modal-content.tsx`
This takes the massive JSX block for the horizontal scroll view (Part 1, Part 2, Part 3) and isolates it.

## The Routing Dilemma
If we use this local state-based zoom, what happens to the production Next.js Intercepting Route (`app/@modal/(.)projects/[id]/page.tsx`)?
- Currently, clicking a card does `router.push('/projects/xyz')`.
- If we hijack the click to do `zoomTo(...)`, the URL doesn't change, and the route doesn't intercept.
- If we DO `router.push` AND `zoomTo`, the intercepting route will render its own modal, conflicting with our `ZoomLayout` modal.

### The Production Integration Plan
To safely integrate without destroying Next.js parallel routing:

**Phase 1 (The Reusable Component)**
Refactor the logic in `zoom-test/page.tsx` into a single, clean file `components/project-zoom-gallery.tsx`.
This component takes an array of `Project` objects and handles its own grid, its own cards, and its own modal.

**Phase 2 (The Swap)**
In `app/page.tsx`, simply replace the existing static mapping of `ProjectCard` with `<ProjectZoomGallery projects={allProjects} />`.

**Phase 3 (The Route Sync - Optional but recommended)**
Inside the `handleCardClick` of the new gallery, we can call `window.history.pushState(null, '', \`/projects/\${project.id}\`)` to update the URL silently, allowing users to share the link. We bypass the Next.js router entirely for this specific interaction to maintain perfect animation control.

This is exactly what the user suggested: "오히려 프로토 타입에 정의해 놔야 할수 있어" (We might have to define the data structures in the prototype instead).

### Action Plan
1. I will create `components/project-zoom-gallery.tsx`.
2. I will move all the logic from `zoom-test/page.tsx` into this new component.
3. I will update `zoom-test/page.tsx` to simply render `<ProjectZoomGallery />`.
4. This proves the component is completely portable and ready to be dropped into `app/page.tsx`.