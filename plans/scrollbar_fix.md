# Scrollbar Issue Analysis

## Why did the scrollbars come back?
When we built the prototype in `app/zoom-test/page.tsx`, we added a `<style jsx global>` block directly inside that page component to aggressively hide the scrollbars:

```css
html, body {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  overflow-y: scroll;
}
html::-webkit-scrollbar, body::-webkit-scrollbar {
  display: none !important;
  /* ... */
}
```

When we migrated the `ProjectZoomGallery` to the *actual* homepage (`app/page.tsx`), we only moved the React component. The global CSS block was left behind in the `zoom-test` file. Because you are now looking at the real homepage, that CSS is no longer being loaded by Next.js.

## The Fix
We need to take those specific CSS rules and put them into the central CSS file that controls the entire application: `app/globals.css`.

This ensures that the scrollbars stay hidden across the entire site, including the homepage, without relying on a specific page to mount a `<style>` block.

I will switch to code mode and inject these styles into `app/globals.css`.