// The id a post heading gets from its text ("One Clock" → "one-clock"). Shared by the
// build (postMeta.js lists each post's sections) and the heading component that renders
// them (MdxElements.jsx), so the "In this post" links always have a target.
export const headingId = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
