import { ArrowUpRight } from 'lucide-react'
import RouteLink from '../components/RouteLink'
import { formatPostDate, posts } from '../lib/posts'

export default function BlogPage({ onNavigate }) {
  return (
    <div className="page-shell pt-4 md:pt-8 pb-12">
      <div className="mb-10 flex flex-col gap-4 border-b pb-8 md:mb-12 md:flex-row md:items-end md:justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <h1 className="display-heading page-title" style={{ color: 'var(--color-text)' }}>
          Blog
        </h1>
        <p className="max-w-[360px] text-sm leading-6 md:text-right" style={{ color: 'var(--color-text-secondary)' }}>
          Notes on things I build, with demos you can poke at right in the post.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
          No posts yet. Check back soon.
        </p>
      ) : (
        <ol className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {posts.map((post) => (
            <li key={post.slug} style={{ borderColor: 'var(--color-border)' }}>
              <RouteLink
                to="blog"
                slug={post.slug}
                onNavigate={onNavigate}
                // Start fetching the post's chunk on intent, so opening it rarely waits.
                onPointerEnter={post.load}
                onFocus={post.load}
                className="group grid gap-2 py-7 md:grid-cols-[10rem_1fr_auto] md:items-baseline md:gap-8"
              >
                <time dateTime={post.date} className="eyebrow" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatPostDate(post.date)}
                </time>
                <span>
                  <span className="display-heading block text-[length:var(--text-card-title)] transition-colors group-hover:text-[color:var(--color-accent)]" style={{ lineHeight: 1.05 }}>
                    {post.title}
                    {post.draft && (
                      <span className="eyebrow ml-3 align-middle" style={{ color: 'var(--color-accent)' }}>Draft</span>
                    )}
                  </span>
                  <span className="mt-3 block max-w-xl text-[length:var(--text-body)] leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                    {post.description}
                  </span>
                </span>
                <span className="eyebrow flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {post.readingMinutes} min read
                  <ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </RouteLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
