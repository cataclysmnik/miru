"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthRole } from "@/context/RoleAuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, userProfile, user, signOut, isTeacher } = useAuthRole();

  const rawName = userProfile?.name;
  const displayName = (rawName && !rawName.includes("@") && !rawName.toLowerCase().includes("nikunj")) 
    ? rawName 
    : (isTeacher ? "Prof. Kenneth Mori" : "Sagnik Singha");
  const idNumber = userProfile?.idNumber || (isTeacher ? "58291" : "24BRS1242");
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 lg:px-8 z-10">
          <div className="flex-1 max-w-lg relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              className="pl-10 h-11 bg-muted/60 border border-border/40 rounded-xl w-full text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" 
              placeholder={isTeacher ? "Search students, courses, submissions..." : "Search courses, assignments, syllabus..."} 
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            <ThemeToggle />

            <button 
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/40"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* User Profile Pill with Strict Role and ID */}
            <div className="flex items-center gap-3 border-l border-border pl-4 sm:pl-5">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-serif italic text-lg border border-primary/20 shadow-xs">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground max-w-[140px] truncate">{displayName}</p>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isTeacher 
                      ? "bg-primary/15 text-primary border border-primary/20" 
                      : "bg-secondary text-secondary-foreground border border-border"
                  }`}>
                    {isTeacher ? "Teacher" : "Student"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  <span className="text-foreground font-medium">{idNumber}</span>
                </p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
