import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function JapaneseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="text-primary">
      <text x="4" y="24" fontSize="20" fontWeight="bold" fill="currentColor">あ</text>
    </svg>
  )
}

function PenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  )
}

const projects = [
  {
    name: 'know-your-attention',
    description: 'Track your tasks and time cost. Stay focused on what matters.',
    tags: ['React', 'TypeScript'],
    url: 'https://attention.groundedglow.cc/',
    icon: ClockIcon,
  },
  {
    name: 'japaflow',
    description: 'Learn Japanese through structured practice and repetition.',
    tags: ['React', 'TypeScript'],
    url: 'https://japaflow.groundedglow.cc/',
    icon: JapaneseIcon,
  },
  {
    name: 'blog',
    description: 'A clean space for writing and reading.',
    tags: ['Next.js', 'TypeScript'],
    url: 'https://blog.groundedglow.cc/',
    icon: PenIcon,
  },
]

const articles = [
  {
    title: 'Building a micro-frontend with Next.js and wujie',
    date: '2025-05',
    image: '/images/articles/micro-frontend.svg',
  },
  {
    title: 'How I structure my full-stack projects',
    date: '2025-04',
    image: '/images/articles/full-stack.svg',
  },
  {
    title: 'Lessons from building a Japanese learning app',
    date: '2025-03',
    image: '/images/articles/japanese-app.svg',
  },
]

const books = [
  {
    title: 'Designing Data-Intensive Applications',
    comment: 'The best book on distributed systems I have read so far.',
    cover: '/images/books/ddia.svg',
  },
  {
    title: 'Clean Code',
    comment: 'Some good principles, though I disagree with a few points on comments.',
    cover: '/images/books/clean-code.svg',
  },
]

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      {/* Site Header — Logo + Slogan */}
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Grounded</span> Glow
        </h1>
        <p className="mt-2 text-muted-foreground">
          A garden for curiosity, reflection, and steady growth.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* Left — Main content */}
        <main className="min-w-0 space-y-10">
          {/* Hero message */}
          <section>
            <p className="text-lg leading-relaxed text-foreground">
              This is a place to think, write, and build.
              I believe in staying grounded while reaching for light — following curiosity,
              crafting tools that matter, and growing one step at a time.
            </p>
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Projects</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {projects.map((project) => (
                <a key={project.name} href={project.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <Card className="h-full transition-shadow group-hover:shadow-md">
                    <CardHeader className="pb-2">
                      <project.icon />
                      <CardTitle className="mt-1 text-sm">{project.name}</CardTitle>
                      <CardDescription className="text-xs">{project.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="gap-1.5 flex-wrap pt-0">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </CardFooter>
                  </Card>
                </a>
              ))}
            </div>
          </section>

          {/* Articles */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Recent Articles</h2>
            <div className="space-y-3">
              {articles.map((article) => (
                <Card key={article.title} className="flex flex-row overflow-hidden transition-shadow hover:shadow-md">
                  <div className="shrink-0 w-24 bg-muted flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-3 flex flex-col justify-center">
                    <p className="font-medium text-sm">{article.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{article.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Book Notes */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Book Notes</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {books.map((book) => (
                <Card key={book.title} className="flex flex-row overflow-hidden">
                  <div className="shrink-0 w-16 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-3 flex flex-col justify-center">
                    <p className="font-medium text-xs">{book.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{book.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>

        {/* Right — About Me sidebar */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader className="items-center text-center pb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avatar.png"
                alt="Yefei"
                className="h-20 w-20 rounded-full object-cover"
              />
              <CardTitle className="mt-2 text-base">About Me</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                Hi, I'm <span className="text-foreground font-medium">Yefei</span>. Frontend developer with 10+ years of experience. Previously worked as a Frontend Expert at Alibaba.
              </p>
              <p>
                Currently based in Japan, open to new opportunities. Interested in frontend, full-stack development, and AI agents.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <Badge variant="secondary" className="text-[10px]">Frontend</Badge>
                <Badge variant="secondary" className="text-[10px]">Full Stack</Badge>
                <Badge variant="secondary" className="text-[10px]">AI Agent</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs text-muted-foreground border-t pt-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
                <a href="mailto:tinyfool24@gmail.com" className="hover:text-foreground transition-colors">Email</a>
                <a href="https://github.com/tangyefei" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                <a href="https://x.com/tangyefei24" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter/X</a>
              </div>
              <span>WeChat: tangyefei24</span>
            </CardFooter>
          </Card>
        </aside>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t py-6 text-center text-xs text-muted-foreground">
        &copy; 2025 Grounded Glow
      </footer>
    </div>
  )
}
