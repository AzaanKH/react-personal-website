import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import RouteLink from '../components/RouteLink'
import { mdxComponents } from '../lib/mdxComponents'
import { formatPostDate, getPost } from '../lib/posts'

function BackLink({ onNavigate }) {
  return (
    <RouteLink
      to="blog"
      onNavigate={onNavigate}
      className="eyebrow hover-accent inline-flex items-center gap-2"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <ArrowLeft size={14} aria-hidden="true" /> All posts
    </RouteLink>
  )
}

export default function BlogPostPage({ slug, onNavigate }) {
  const post = getPost(slug)

  // /blog/* is an SPA rewrite in netlify.toml, so unknown slugs land here, not on 404.html.
  if (!post) {
    return (
      <div className="page-shell pt-4 md:pt-8 pb-12">
        <BackLink onNavigate={onNavigate} />
        <h1 className="display-heading post-title mt-8" style={{ color: 'var(--color-text)' }}>
          Post not found
        </h1>
        <p className="mt-6 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          There&apos;s no post at this address. It may have moved or been unpublished.
        </p>
      </div>
    )
  }

  const { Content } = post

  return (
    <article className="page-shell pt-4 md:pt-8 pb-16">
      <BackLink onNavigate={onNavigate} />
      {/* The header renders outside Suspense, so the h1 exists immediately for
          PageTransition to focus while the post body's chunk loads. */}
      <header className="mx-auto mt-8 max-w-[42rem] border-b pb-8" style={{ borderColor: 'var(--color-border)' }}>
        <p className="eyebrow flex flex-wrap gap-x-3 gap-y-1" style={{ color: 'var(--color-text-secondary)' }}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          {post.draft && <span style={{ color: 'var(--color-accent)' }}>Draft</span>}
        </p>
        <h1 className="display-heading post-title mt-5" style={{ color: 'var(--color-text)' }}>
          {post.title}
        </h1>
        <p className="mt-5 text-lg leading-8" style={{ color: 'var(--color-text-secondary)' }}>
          {post.description}
        </p>
      </header>

      <Suspense fallback={<p className="post-prose mx-auto mt-10 eyebrow" style={{ color: 'var(--color-text-secondary)' }}>Loading…</p>}>
        <div className="post-prose mx-auto mt-10">
          <Content components={mdxComponents} />
        </div>
      </Suspense>
    </article>
  )
}
