import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-secondary selection:text-foreground">
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-serif italic text-xl leading-none mt-1">m</span>
          </div>
          <span className="font-serif text-2xl tracking-wide text-foreground">miru</span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <Link href="/login?role=teacher" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide hidden sm:inline-block">
            Teacher Portal
          </Link>
          <Link href="/login?role=student" className="text-sm font-medium hover:text-primary transition-colors tracking-wide">
            Student Sign In
          </Link>
          <Link href="/register?role=student">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 tracking-wide shadow-sm transition-all duration-300">
              Begin Journey
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-24 md:py-32 lg:py-48 flex items-center justify-center overflow-hidden">
          {/* Subtle background circles for organic feel */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/40 rounded-full blur-3xl -z-10 mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 mix-blend-multiply dark:mix-blend-screen"></div>
          
          <div className="container px-4 md:px-6 text-center space-y-10 relative z-10">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-4 tracking-widest uppercase">
              A mindful approach to learning
            </div>
            
            <h1 className="text-5xl font-serif tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.1]">
              Clarity in <br className="hidden sm:block" />
              <span className="text-primary font-light italic">education.</span>
            </h1>
            
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl font-light leading-relaxed">
              Experience a tranquil, focused environment for managing courses, assignments, and grades. Find your flow with miru.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/login?role=student">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                  <span>🎓</span> Student Access
                </Button>
              </Link>
              <Link href="/login?role=teacher">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-border bg-card/60 backdrop-blur text-foreground hover:bg-secondary/40 transition-all duration-300 flex items-center gap-2">
                  <span>👨‍🏫</span> Teacher Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 flex justify-center bg-muted/30 border-y border-border/50">
          <div className="container px-4 md:px-6 grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="flex flex-col items-center text-center space-y-5 p-8 rounded-3xl bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-secondary/60 flex items-center justify-center text-primary font-serif italic text-2xl">一</div>
              <h3 className="text-xl font-medium tracking-wide text-card-foreground">Harmonious Courses</h3>
              <p className="text-muted-foreground font-light leading-relaxed">Organize syllabus and resources with elegant simplicity. Remove clutter from the learning experience.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-5 p-8 rounded-3xl bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-secondary/60 flex items-center justify-center text-primary font-serif italic text-2xl">二</div>
              <h3 className="text-xl font-medium tracking-wide text-card-foreground">Mindful Assignments</h3>
              <p className="text-muted-foreground font-light leading-relaxed">Publish tasks and track submissions peacefully. Set expectations clearly and effortlessly.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-5 p-8 rounded-3xl bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-secondary/60 flex items-center justify-center text-primary font-serif italic text-2xl">三</div>
              <h3 className="text-xl font-medium tracking-wide text-card-foreground">Gentle Insights</h3>
              <p className="text-muted-foreground font-light leading-relaxed">View student progress through calming visualizations. Understand performance at a glance.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-10 bg-background text-center text-sm text-muted-foreground font-light tracking-wide border-t border-border/30">
        &copy; 2026 miru LMS. Cultivated with care.
      </footer>
    </div>
  );
}
