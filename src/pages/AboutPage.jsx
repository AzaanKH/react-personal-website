import { ArrowRight, FileText } from 'lucide-react'
import Kicker from '../components/Kicker'
import RouteLink from '../components/RouteLink'

// Facts and wording follow public/Azaan_Resume.pdf. Update both together.
const experience = [
  {
    role: 'Software Engineer Intern (Contract)',
    org: 'Microsoft',
    place: 'Redmond, WA',
    dates: 'Oct 2024 – Jan 2025',
    points: [
      'Built C#/.NET Azure Function Apps that connect two enterprise systems, processing Service Bus messages asynchronously and syncing application data with Microsoft Dataverse.',
      'Added REST API integrations and production observability with structured logging and Application Insights telemetry.',
      'Secured service-to-service calls with Azure Managed Identities, and wrote unit, integration, and end-to-end tests covering more than 90% of the core integration workflows.',
    ],
  },
  {
    role: 'Teaching Assistant',
    org: 'University of Washington',
    place: 'Seattle, WA',
    dates: 'Apr 2024 – Jun 2024',
    points: [
      'Led weekly sections for 24+ students on browser engineering and web architecture.',
      'Wrote 8+ sets of learning materials and reviewed 200+ assignments for correctness, code quality, and design.',
    ],
  },
]

const education = [
  { degree: 'Master of Computer Science', school: 'Arizona State University', dates: 'Expected 2028' },
  { degree: 'B.S. in Computer Science', school: 'University of Washington', dates: 'June 2024' },
]

const skills = [
  { label: 'Languages', items: 'Python, Java, C#, JavaScript, TypeScript, SQL, Go, C++' },
  { label: 'Frameworks', items: 'React, Flask, FastAPI, .NET, Node.js, Pydantic' },
  { label: 'Cloud & infrastructure', items: 'Azure Functions, Service Bus, Application Insights, Docker, Kubernetes, CI/CD' },
  { label: 'Data', items: 'PostgreSQL, TimescaleDB, Redis, Convex' },
  { label: 'AI & developer tools', items: 'Model Context Protocol, FastMCP, Claude Code, OpenAI Codex' },
]

function Block({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="border-t pt-8 mt-12" style={{ borderColor: 'var(--color-border)' }}>
      <h2
        id={id}
        className="display-heading mb-8"
        style={{ fontSize: 'var(--text-section-title)', color: 'var(--color-text)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

// One row: dates (or a label) in the left column, the entry on the right.
function Row({ aside, children }) {
  return (
    <li className="grid gap-2 md:grid-cols-[10rem_1fr] md:gap-8">
      <p className="eyebrow pt-1.5" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{aside}</p>
      <div>{children}</div>
    </li>
  )
}

export default function AboutPage({ onNavigate }) {
  return (
    <div className="page-shell pb-16 pt-4 md:pt-8">
      <Kicker className="mb-5">About</Kicker>
      <h1 className="display-heading page-title" style={{ color: 'var(--color-text)' }}>
        The short <em style={{ color: 'var(--color-accent)' }}>version.</em>
      </h1>
      <p className="mt-8 max-w-2xl text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
        I&apos;m a software engineer in Bellevue, WA. I build developer tools, intelligent systems, and web
        apps, most recently on Azure integrations at Microsoft, and I&apos;m working toward a Master of
        Computer Science at Arizona State University.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <RouteLink
          to="projects"
          onNavigate={onNavigate}
          className="press hover-accent-bg group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em]"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', boxShadow: 'var(--shadow-sm)' }}
        >
          View projects
          <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </RouteLink>
        <a
          href="/Azaan_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hover-text inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
        >
          <FileText size={15} strokeWidth={1.5} aria-hidden="true" />
          Résumé (PDF)
        </a>
      </div>

      <Block id="about-experience" title="Experience">
        <ol className="space-y-10">
          {experience.map(({ role, org, place, dates, points }) => (
            <Row key={role} aside={dates}>
              <h3 className="text-lg font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>{role}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {org} · {place}
              </p>
              <ul className="mt-4 max-w-[68ch] space-y-2">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                    <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Row>
          ))}
        </ol>
      </Block>

      <Block id="about-education" title="Education">
        <ol className="space-y-6">
          {education.map(({ degree, school, dates }) => (
            <Row key={degree} aside={dates}>
              <h3 className="text-lg font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>{degree}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{school}</p>
            </Row>
          ))}
        </ol>
      </Block>

      <Block id="about-skills" title="Skills">
        <ul className="space-y-5">
          {skills.map(({ label, items }) => (
            <Row key={label} aside={label}>
              <p className="max-w-[68ch] text-sm leading-6" style={{ color: 'var(--color-text)' }}>{items}</p>
            </Row>
          ))}
        </ul>
      </Block>
    </div>
  )
}
