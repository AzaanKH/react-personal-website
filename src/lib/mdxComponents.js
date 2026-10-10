import { Callout, Heading1, Link } from '../components/blog/MdxElements'

// What markdown renders as inside a post, passed to each post as `components`. Anything
// here is also usable in every .mdx file without an import (e.g. <Callout>). Keep it to
// small pieces; heavier interactive components should be imported by the posts that use
// them, so they ship in that post's chunk only.
export const mdxComponents = { h1: Heading1, a: Link, Callout }
