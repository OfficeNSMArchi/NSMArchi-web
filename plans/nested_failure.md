# Analysis of Nested Expansion Scale Failure

## The Problem
The user reports that the nested modal is completely ignoring the intended sizing logic (e.g., matching viewport width on mobile, or 40% height/width on desktop). Instead, it's rendering massively oversized or wildly unpredictable.

## The Architecture Flaw
Let's look at what we are actually scaling.
In `ProjectZoomGallery`:
```tsx
const getContainerStyle = () => {
    return {
      transform: `scale(${zoomData.targetScale}) ...`,
    };
};
// ...
<div style={getContainerStyle()}>
  <div className="grid...">
    <ProjectZoomCard />
```

We are applying the CSS `transform: scale(...)` to the **ENTIRE GALLERY CONTAINER**.
This was fine in the old "World Zoom" model where the modal was *outside* the gallery.
BUT, now we have **Nested Expansion**. The modal content is *inside* `ProjectZoomCard`.

### The Catastrophic Math Collision
Inside `ProjectZoomCard`:
```tsx
<div style={{ width: isExpanded ? (vw >= 1024 ? '40%' : '100%') : '100%' }}>
```
Think about what happens here:
1. The grid item (the card) sits in a column. Let's say its `rect.width` is 300px.
2. When clicked, `isExpanded` becomes true.
3. The inside div suddenly changes its width to `vw >= 1024 ? '40%' : '100%'`. Wait, no, it's wrapped in:
```tsx
<div className={`absolute inset-0 ... ${isExpanded ? 'fixed inset-0 m-auto' : 'relative w-full h-full'}`}>
```
AH! We changed the card's inner wrapper to `position: fixed` when expanded!

**BUT WE ARE SCALING THE PARENT CONTAINER!**
CSS `transform` creates a new containing block. A `position: fixed` element inside a transformed parent behaves like `position: absolute` relative to the transformed parent, NOT the viewport.

So:
1. The parent gallery is scaled by `targetScale` (e.g., `1000vw / 300px = 3.33`).
2. The card inside it becomes `fixed inset-0`. Because the parent is transformed, `inset-0` makes the card fill the *parent's layout bounds*.
3. What are the parent's layout bounds? The grid container.
4. AND THEN, because the parent is scaled by 3.33, everything inside it is visually multiplied by 3.33.

So if the card fills the grid, and then the grid is scaled by 3.33, the card becomes absolutely massive.
And the math for `translateX` and `translateY` is moving the parent container based on where the *unscaled* card was, but the card has now expanded to fill the grid AND been scaled.

**This is a total disaster of CSS physics.** We mixed "scale the parent" with "expand the child via layout".

## The Solution: Pick ONE Expansion Strategy

We cannot do both. We must choose either:
**Option A: Pure Layout Expansion (FLIP Animation)**
- Do not scale the parent at all.
- When clicked, clone the card, make it `position: fixed`, and animate its `top/left/width/height` from the original `rect` to the target viewport dimensions.
- This is incredibly complex to get smooth across browsers.

**Option B: The Original "World Zoom" (Un-Nest the Modal)**
- Go back to scaling the parent container.
- Put the modal **OUTSIDE** the parent container.
- We already proved this worked perfectly in terms of math. The only reason we abandoned it was the "separate pieces" feeling. But if the math is perfect, the visual feeling is just a matter of tuning the opacity and z-index overlap.

**Option C: Transform the Child, NOT the Parent**
- Do not scale the `ProjectZoomGallery`.
- Leave the parent alone.
- Apply `transform: scale(...)` and `translate(...)` to the **specific clicked card**.
- The card stays in the grid (`position: relative`), but its visual representation scales up to fill the screen.

### Let's explore Option C (Transform Child)
If we scale the child:
1. Grid stays normal.
2. Clicked card gets `z-index: 100`.
3. We calculate `targetScale` to make the card `vw` wide (mobile) or `vw * 0.4` wide (desktop).
4. We calculate `translate` to move the card from its current spot to the center of the viewport.

Let's do the math for Option C:
- Card's current center relative to viewport:
  `cx = rect.left + rect.width / 2`
  `cy = rect.top + rect.height / 2`
- Target center relative to viewport:
  `tx = vw / 2`
  `ty = vh / 2`
- Required translation *before* scale:
  `translateX = tx - cx`
  `translateY = ty - cy`

If we apply `transform: translate(translateX, translateY) scale(targetScale)` to the card:
- The `transform-origin` defaults to `50% 50%` (the center of the card).
- The card moves to the center of the screen.
- Then it scales up around its center.

**Wait, CSS order matters.**
`translate(...) scale(...)` means it moves, THEN scales.
But wait. If it scales, it scales around its center.
Because it's already in the center of the screen, scaling it around its center keeps it in the center of the screen!
This is incredibly simple and elegant.

### What about the Modal Content (Part 2)?
The modal content is physically wider than the card. The card is 1 column. The modal has a side panel and a text panel.
If we put the modal content inside the card, and scale the card, the modal content gets scaled too.
If the modal content is text, scaling it makes the text huge and blurry.
We do NOT want to CSS-scale the text.

### The Real Reality Check
This is exactly why the original "World Zoom" (Option B) is the standard pattern for this.
You scale the background (the world) so the target image comes to the camera.
Then you fade in a completely separate, unscaled `fixed` overlay containing the crisp text and layout.

The user's complaint about Option B was: "2열인경우에 무슨 이유인지 프로젝트 카드 위치와 인덱스 카드위치의 가로위치가 약간 어긋나서 겹쳐" (In 2-column, the background card and modal card are misaligned).
We FIXED this misalignment right before we threw the whole architecture away! The fix was `document.documentElement.clientWidth` and correcting the `transform-origin`.

The user said "좋아 이제 작동 잘되는듯" (Good, it seems to work well now) right after we fixed that.
The only reason we moved to Nested Expansion was my suggestion to make it "more native". But Nested Expansion breaks because of CSS `fixed` contexts inside `transform`.

We must revert the architecture to the proven "World Zoom" (Option B) that we had perfected in the `zoom-test`, and simply apply the correct width/height math.

### Reversion Plan
1. Revert `components/project-zoom-gallery.tsx` to the state where the Modal is an overlay OUTSIDE the scaling container.
2. Keep the `clientWidth` scrollbar fix.
3. Keep the `containerRect` origin math fix.
4. Ensure `targetScale` calculates the 40% (or whatever the user asked for - "40% 미만으로 떨어져서" means it was too small, maybe they meant the desktop layout was too small, or mobile was wrong).
5. The user asked: "90%기준을 40%로 낮춰봐" (Lower 90% to 40%). We did that, and it broke because of the nested architecture. We will restore the 90% safety cap (or whatever is appropriate) in the un-nested architecture.