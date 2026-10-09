"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthRole, UserRole } from "@/context/RoleAuthContext";
import { GraduationCap, BookOpen, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAccount } = useAuthRole();

  const [portalRole, setPortalRole] = useState<UserRole>("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if (roleParam === "TEACHER" || roleParam === "STUDENT") {
      setPortalRole(roleParam as UserRole);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginAccount(identifier.trim(), password, portalRole);
      if (!result.success) {
        setError(result.error || "Failed to sign in. Please check your credentials.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 bg-background selection:bg-secondary">
      {/* Return Home link */}
      <div className="w-full max-w-md mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to miru
        </Link>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
            <span className="text-primary-foreground font-serif italic text-2xl leading-none mt-1">m</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
            {portalRole === "TEACHER" ? "Teacher Portal" : "Student Portal"}
          </h1>
          <p className="text-xs text-muted-foreground font-light">
            {portalRole === "TEACHER"
              ? "Sign in with your Employee ID and password"
              : "Sign in with your Registration ID and password"}
          </p>
        </div>

        {/* Portal Selector Tabs */}
        <div className="p-1 bg-muted/70 border border-border rounded-xl grid grid-cols-2 gap-1 mb-6">
          <button
            type="button"
            onClick={() => { setPortalRole("STUDENT"); setError(""); setIdentifier(""); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              portalRole === "STUDENT"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-primary" />
            Student Login
          </button>
          <button
            type="button"
            onClick={() => { setPortalRole("TEACHER"); setError(""); setIdentifier(""); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              portalRole === "TEACHER"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Teacher Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>{portalRole === "TEACHER" ? "Employee ID or Email" : "Registration ID or Email"}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {portalRole === "TEACHER" ? "5 digits or email" : "e.g. 24BRS1242"}
              </span>
            </label>
            <Input
              required
              placeholder={portalRole === "TEACHER" ? "e.g. 58291 or faculty@domain.edu" : "e.g. 24BRS1242 or student@domain.edu"}
              value={identifier}
              onChange={(e) => {
                const val = e.target.value;
                // If it contains @ or ., treat as email (don't force uppercase or strip letters)
                if (val.includes("@")) {
                  setIdentifier(val);
                } else if (portalRole === "TEACHER") {
                  // Allow up to 5 digits or full email
                  setIdentifier(val);
                } else {
                  // Registration ID format
                  setIdentifier(val.toUpperCase());
                }
              }}
              className="rounded-xl bg-muted/40 font-mono text-sm tracking-wide"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {portalRole === "TEACHER"
                ? "Enter your 5-digit Employee ID or your registered email address."
                : "Enter your Registration ID (e.g. 24BRS1242) or your registered email address."}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <Input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl bg-muted/40 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs text-sm font-semibold mt-2"
          >
            {isLoading ? "Signing In..." : `Enter ${portalRole === "TEACHER" ? "Teacher Portal" : "Student Portal"}`}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link href={`/register?role=${portalRole.toLowerCase()}`} className="text-primary hover:underline font-semibold">
            Register as a {portalRole === "TEACHER" ? "Teacher" : "Student"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
