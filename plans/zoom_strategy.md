# Math Failure Analysis: Fluid Grid & Zoom Math

## The Problem
The zoom math worked perfectly when cards had fixed widths/heights. It is now failing horizontally on 2-column (tablet) layouts, and vertically on 3-column (desktop) layouts.

## Hypothesis 1: Misalignment of "Center" in Modal vs Grid
Let's analyze the 2-column layout (vw between 640px and 1024px).
- **Background Grid (Tailwind)**: `sm:grid-cols-2`. Container is `max-w-7xl` (1280px).
- **JS Breakpoint**: `isDesktop` is defined as `vw >= 1024`.
- So for a 800px window (2 columns):
    - `isDesktop = false`
    - `targetScale = vw / rect.width` (Width scales to 100%)
    - `targetViewportX = vw / 2` (Zoom target is center of screen)
    - `targetViewportY = vh / 2` (Zoom target is vertical center)

Wait, what does the Modal do in a 2-column layout?
```tsx
const isDesktop = vw >= 1024;
// ...
<div style={{ width: selectedProject.vw < 1024 ? `${selectedProject.vw}px` : '40%' }}>
```
The modal card cover is 100% wide (`vw`).
So the Modal Card Cover is centered horizontally at `vw / 2`.
The Background Card is zoomed to `targetViewportX = vw / 2`.
Mathematically, they *should* align perfectly.

Why are they horizontally misaligned in 2-column?

### Look at `ProjectZoomCard`
```tsx
<button className="relative w-full aspect-[4/3] ...">
```
Is `rect.width` capturing the full width? Yes.

### Look at `ProjectZoomGallery` container
```tsx
<div className="relative w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 justify-items-center">
```
Wait. `max-w-7xl` is 1280px.
If the window is 1400px wide:
- The grid is centered, taking up 1280px.
- `vw` is 1400.
- Does this affect the math?
- `targetViewportX = vw * 0.3 = 420px`.
- `currentViewportX` is calculated from `rect.left`. `rect.left` will be larger because the grid is centered in the 1400px window.
- The formula `targetViewportX - currentViewportX` translates the card to `X=420` regardless of the grid's max-width.
- The modal is `fixed`, `left: 0`, `width: 1400px`.
- Inside the modal, the panel is 10% (140px). The cover is 40% (560px).
- The center of the cover in the modal is `140 + 280 = 420px`.
- Mathematical MATCH!

## Hypothesis 2: Vertical Misalignment (Aspect Ratio Conflict)
The user reported: "그리고 데스크탑에서도 상하가 어긋나고" (And vertically misaligned on desktop too).

**Desktop Background Math:**
```javascript
const targetScale = isDesktop ? (vw * 0.4 / rect.width) : (vw / rect.width);
```
We scale the background so the card width becomes `vw * 0.4`.
Because the background card has `aspect-[4/3]`, its height scales proportionally to `(vw * 0.4) * (3/4)`.

**Desktop Modal Math:**
```javascript
const cardHeight = Math.round(rect.height * targetScale) + MODAL_HEIGHT_BUFFER;
```
Wait. The modal card cover container:
```tsx
<div style={{ width: '40%', height: '100%' }}>
  <Image fill ... />
</div>
```
Wait, the `scrollContainerRef` is inside the modal.
```tsx
<div style={getModalStyle()}>
   // getModalStyle defines height: `${cardHeight}px`
```
So the entire modal is `cardHeight` tall.
The image container has `height: '100%'`.
So the image container is EXACTLY `cardHeight` tall.

BUT `cardHeight = Math.round(rect.height * targetScale) + MODAL_HEIGHT_BUFFER;`
If `MODAL_HEIGHT_BUFFER` is 20, the modal is **20px taller** than the perfectly scaled background card.
The image inside the modal has `fill` and `object-cover`. It will expand to fill that extra 20px.
Because the modal is centered via `transform: translateY(-50%)`, adding 20px height pushes the top of the modal up 10px and the bottom down 10px.
BUT the background card is centered at `vh / 2` exactly.
Wait! If the modal is 20px taller, and the image covers it, the image in the modal will be visually taller than the image in the background. Is the image content identical? `object-cover` might crop it differently!

**Fix 1:** The `MODAL_HEIGHT_BUFFER` was added for sub-pixel fixing. But with fluid aspect ratios, expanding the container height by 20px forces `object-cover` to rethink its crop, changing the visual contents of the image.
If we want a buffer to hide sub-pixels, we should scale the container, NOT change its height. We already do `scale(1.005)` in `getModalStyle`. We MUST REMOVE `MODAL_HEIGHT_BUFFER`.

## Hypothesis 3: The Scrollbar (Again)
The padding compensation:
```javascript
document.body.style.paddingRight = `${scrollbarWidth}px`;
```
This adds padding to the `<body>`.
But our fixed modal:
```tsx
return {
  position: 'fixed',
  left: `0px`,
  width: `${vw}px`, // vw is clientWidth
```
Wait! If `vw` is `clientWidth`, and the scrollbar disappears, `vw` does not change (because the scrollbar was 15px, and now there is 15px padding).
Wait. If we add `padding-right` to `body`, does it affect `position: fixed` elements?
No. `position: fixed` elements attach to the viewport.
If the viewport loses its scrollbar, the viewport physically becomes 1015px wide!
But our modal is hardcoded to `width: ${vw}px` (1000px).
If the viewport is 1015px, and our modal is `width: 1000px`, the modal is NOT taking up the full screen!
Wait... `vw` was captured on click.
Before click: screen has scrollbar. `window.innerWidth` = 1015, `clientWidth` = 1000.
We set modal `width: 1000px`.
During animation, scrollbar hides. Viewport width is now 1015.
Modal stays 1000px wide. Modal is anchored `left: 0`.
It does not fill the screen. It leaves a 15px gap on the right.
This means `40%` width in the modal is `400px`.
What about the background?
The background container is in the `<body>`. The `<body>` has 15px padding. Its content box is still 1000px wide. The grid stays exactly in the same physical pixels.
The math `(vw * 0.3)` uses `1000 * 0.3 = 300px`.
So the background card's center translates to exactly `300px` from the left edge of the document.
The modal card's center is `10% of 1000 + 20% of 1000 = 100 + 200 = 300px`.
Mathematically, they still align from the left edge.

## Hypothesis 4: `justify-items-center` shifts things?
```tsx
<div className="relative w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 justify-items-center">
```
If the grid has `gap-1` and cards are fluid, they fill the grid column.
`justify-items-center` on a grid where items are `w-full` does nothing, because they already take 100% of the column width.

## Let's simplify the CSS for the Modal.
Instead of calculating `vw` and setting fixed pixel widths on the modal, the modal should naturally fill its space, and we rely on percentages.
```css
/* Modal */
position: fixed;
left: 0;
right: 0; /* Let it stretch */
/* Don't set explicit width! */
```
Wait, if the modal uses percentages (`width: 40%`), and the viewport expands when the scrollbar hides, the modal will physically change size!
If it changes size, 40% of 1015 is 406px.
But the background scaled based on `vw = 1000`. It scaled to `1000 * 0.4 = 400px`.
MISALIGNMENT!

### The Ultimate Truth
**We CANNOT mix viewport-relative math (`vw`, fixed pixel layouts during animation) with responsive layout logic if the viewport size changes.**

If we freeze `vw` at 1000px, the modal MUST be exactly 1000px wide.
```tsx
width: `${vw}px`,
```
This is correct. It ensures the modal exactly matches the background math.

### Let's look closely at `absoluteCardCenterX`.
```javascript
const originX = rect.left + scrollX + (rect.width / 2);
const originY = rect.top + scrollY + (rect.height / 2);
```
Is `rect.left` absolute?
`rect` is `getBoundingClientRect()`. It is relative to the visual viewport.
If we use `transformOrigin: originX, originY`, this is applied to `containerRef`.
Where is `containerRef`?
```tsx
<div 
  ref={containerRef}
  className="w-full flex flex-col items-center"
>
```
If `containerRef` is not the `<body>`, its top-left might not be `0, 0` of the document!
`transformOrigin` in CSS is relative to the element's bounding box.
If `containerRef` starts 100px down the page, `transform-origin: 0 0` is `100px` down.
But our `originY` calculation:
`originY = rect.top + scrollY + ...`
This calculates the absolute coordinate in the DOCUMENT.
If `containerRef` is offset, applying a document absolute coordinate to its `transform-origin` is WRONG!

**BINGO.**
`containerRef` is `<div className="w-full flex flex-col items-center">`.
Inside it, there is `max-w-7xl grid ...`.
If `containerRef` itself has a margin, padding, or is inside a layout that is not `0,0`, its `transform-origin` will be off.
In `zoom-test/page.tsx`:
```tsx
<div className="min-h-screen bg-white overflow-hidden relative">
  <div ref={containerRef} className="min-h-screen p-1 md:p-6 lg:p-8 flex flex-col items-center">
```
`containerRef` is the first child. It probably starts at `0,0`.
Wait, `p-1 md:p-6 lg:p-8`. It has PADDING.
Padding doesn't change `0,0` of the bounding box.
But what if the body has a margin? Next.js globals usually remove margin.
Wait. Does `originY` need to be relative to the `containerRef`?
YES! `transform-origin` is relative to the element it is applied to.
If `containerRef` is at `(0, 0)` in the document, `document.documentElement.scrollTop` matches its offset.
But a safer, 100% accurate way to find the `transform-origin` relative to the container itself:
```javascript
const containerRect = containerRef.current.getBoundingClientRect();
const originX = rect.left - containerRect.left + (rect.width / 2);
const originY = rect.top - containerRect.top + (rect.height / 2);
```
This is mathematically infallible. It completely ignores scroll position, body offsets, layout wrappers, etc.

Let's do the same for `translate`:
If `transform-origin` is perfectly centered on the card, we want to move the container so that point lands on the viewport target.
Where is that point currently in the viewport?
```javascript
const currentViewportX = rect.left + (rect.width / 2);
const currentViewportY = rect.top + (rect.height / 2);
```
Where do we want it to be?
```javascript
const targetViewportX = isDesktop ? (vw * 0.3) : (vw / 2);
const targetViewportY = vh / 2;
```
The physical translation required to move the *element's rendered pixels*:
```javascript
const rawTranslateX = targetViewportX - currentViewportX;
const rawTranslateY = targetViewportY - currentViewportY;
```
And because we `scale(S)` *after* `translate`, the translation needs to be divided by `S`.
This math is sound.

The errors MUST be:
1. `MODAL_HEIGHT_BUFFER` causing `object-cover` to stretch the image, creating a vertical mismatch.
2. `originX/Y` using `scrollY` instead of `containerRect` offsets, causing drift if the container isn't exactly at `0,0`.

Let's fix these two things.
