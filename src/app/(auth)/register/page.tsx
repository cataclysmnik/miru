"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthRole, UserRole } from "@/context/RoleAuthContext";
import { GraduationCap, BookOpen, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerAccount, confirmAccount } = useAuthRole();

  const [role, setRole] = useState<UserRole>("STUDENT");
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verification step state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const resetForm = () => {
    setIsVerifying(false);
    setVerificationCode("");
    setVerifyError("");
    setName("");
    setIdNumber("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if (roleParam === "TEACHER" || roleParam === "STUDENT") {
      setRole(roleParam as UserRole);
    }
    // Always start with fresh registration form, never lingering OTP screen
    setIsVerifying(false);
    setVerificationCode("");
    setVerifyError("");
    setError("");

    return () => {
      setIsVerifying(false);
      setVerificationCode("");
    };
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedId = idNumber.trim().toUpperCase();

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (role === "STUDENT") {
      const studentRegPattern = /^[0-9]{2}[A-Za-z]{3}[0-9]{4}$/;
      if (!studentRegPattern.test(trimmedId)) {
        setError("Register Number must be in the format of 24BRS1242 (e.g. 24BRS1242).");
        return;
      }
    } else {
      const teacherEmpPattern = /^[0-9]{5}$/;
      if (!teacherEmpPattern.test(trimmedId)) {
        setError("Employee ID must be a 5-digit number (e.g. 58291).");
        return;
      }
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await registerAccount({
        email,
        password,
        name: name.trim(),
        role,
        idNumber: trimmedId,
      });
      setIsVerifying(true);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyLoading(true);

    try {
      await confirmAccount(email, verificationCode.trim(), password);
      resetForm();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerifyError(err.message || "Invalid verification code. Please check your email.");
    } finally {
      setVerifyLoading(false);
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
            {isVerifying ? "Confirm Your Email" : "Create Your Account"}
          </h1>
          <p className="text-xs text-muted-foreground font-light">
            {isVerifying 
              ? `Enter the 6-digit code sent to ${email}`
              : role === "TEACHER" 
                ? "Register as an instructor with your official Employee ID" 
                : "Register as a student with your official Register Number"}
          </p>
        </div>

        {!isVerifying ? (
          <>
            {/* Role Tabs */}
            <div className="p-1 bg-muted/70 border border-border rounded-xl grid grid-cols-2 gap-1 mb-6">
              <button
                type="button"
                onClick={() => { setRole("STUDENT"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  role === "STUDENT"
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-primary" />
                Student
              </button>
              <button
                type="button"
                onClick={() => { setRole("TEACHER"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  role === "TEACHER"
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Teacher
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <Input
                  required
                  placeholder={role === "TEACHER" ? "Prof. Kenneth Mori" : "e.g. Sagnik Singha"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl bg-muted/40 text-sm"
                />
              </div>

              {/* Role-Specific Mandatory Identifier */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>{role === "TEACHER" ? "Employee ID (5 digits)" : "Register Number (e.g. 24BRS1242)"}</span>
                  <span className="text-[10px] text-primary font-normal">Mandatory</span>
                </label>
                <Input
                  required
                  maxLength={role === "TEACHER" ? 5 : 9}
                  placeholder={role === "TEACHER" ? "58291" : "24BRS1242"}
                  value={idNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (role === "TEACHER") {
                      // Only allow digits for 5-digit employee ID
                      setIdNumber(val.replace(/\D/g, "").slice(0, 5));
                    } else {
                      setIdNumber(val.toUpperCase().slice(0, 9));
                    }
                  }}
                  className="rounded-xl bg-muted/40 font-mono text-sm tracking-wide"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {role === "TEACHER"
                    ? "Official 5-digit employee identification number (e.g. 58291)."
                    : "Student register number in 24BRS1242 format."}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@domain.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl bg-muted/40 text-sm"
                />
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
                <p className="text-[10px] text-muted-foreground mt-1">
                  Minimum 8 characters with uppercase, lowercase, number, and symbol.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl bg-muted/40 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs text-sm font-semibold mt-2"
              >
                {isLoading ? "Creating Account..." : `Register as ${role === "TEACHER" ? "Teacher" : "Student"}`}
              </Button>
            </form>
          </>
        ) : (
          /* Verification Form */
          <form onSubmit={handleVerify} className="space-y-4 text-left">
            {verifyError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-secondary/60 border border-primary/20 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Security Verification</span>
              </div>
              <p>
                AWS Cognito has sent a verification code to <strong className="text-foreground">{email}</strong>.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Verification Code
              </label>
              <Input
                required
                maxLength={6}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="rounded-xl bg-muted/40 text-center font-mono text-xl tracking-widest h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={verifyLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs text-sm font-semibold"
            >
              {verifyLoading ? "Activating..." : "Confirm & Enter Dashboard"}
            </Button>

            <button
              type="button"
              onClick={resetForm}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              Start new registration or change email
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href={`/login?role=${role.toLowerCase()}`} className="text-primary hover:underline font-semibold">
            Sign in to your portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
