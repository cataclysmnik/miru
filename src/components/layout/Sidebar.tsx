"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BookOpen, 
  FileText, 
  LogOut, 
  GraduationCap, 
  Users, 
  CheckSquare,
  Sparkles
} from "lucide-react";
import { useAuthRole } from "@/context/RoleAuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { role, isTeacher, signOut } = useAuthRole();

  const links = isTeacher
    ? [
        { href: "/dashboard", icon: Home, label: "Teacher Dashboard" },
        { href: "/courses", icon: BookOpen, label: "Manage Courses" },
        { href: "/assignments", icon: CheckSquare, label: "Review & Grade" },
      ]
    : [
        { href: "/dashboard", icon: Home, label: "Student Dashboard" },
        { href: "/courses", icon: BookOpen, label: "Enrolled Courses" },
        { href: "/assignments", icon: FileText, label: "My Assignments" },
      ];

  return (
    <aside className="w-64 bg-card text-card-foreground border-r border-border hidden md:flex flex-col min-h-screen">
      <div className="p-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-serif italic text-xl leading-none mt-1">m</span>
          </div>
          <span className="font-serif font-bold text-2xl tracking-wide text-foreground">miru</span>
        </div>

        {/* Role Portal Pill Badge */}
        <div className="mt-4 px-3 py-1.5 rounded-xl bg-secondary/60 border border-primary/20 flex items-center gap-2 text-xs font-medium">
          {isTeacher ? (
            <>
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground">Teacher Portal</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground">Student Portal</span>
            </>
          )}
          <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Role specific hint card */}
      <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground mb-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{isTeacher ? "Instructor Mode" : "Learner Mode"}</span>
        </div>
        <p className="font-light leading-relaxed">
          {isTeacher 
            ? "You can create courses and grade submissions."
            : "You can submit work and track your coursework."}
        </p>
      </div>

      <div className="p-4 border-t border-border space-y-1 text-muted-foreground text-sm">
        <button 
          onClick={signOut}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
