"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  getCurrentUser, 
  fetchUserAttributes,
  signOut as amplifySignOut,
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp
} from "aws-amplify/auth";
import { useRouter } from "next/navigation";

export type UserRole = "STUDENT" | "TEACHER";

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  idNumber: string; // Register Number for Student, Employee ID for Teacher
  idLabel: string;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  idNumber: string;
}

interface RoleAuthContextType {
  role: UserRole;
  userProfile: UserProfile | null;
  isTeacher: boolean;
  isStudent: boolean;
  user: { userId?: string; username?: string; email?: string } | null;
  isLoading: boolean;
  registerAccount: (params: RegisterParams) => Promise<{ nextStep: string }>;
  confirmAccount: (email: string, code: string, password?: string) => Promise<void>;
  loginAccount: (identifier: string, password: string, portalRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const RoleAuthContext = createContext<RoleAuthContextType | undefined>(undefined);

// Helper to get local user registry
function getUserRegistry(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("miru_user_registry");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to format student name from email
function formatNameFromEmail(email: string): string {
  if (!email) return "Student";
  const userPart = email.split("@")[0];
  if (userPart.toLowerCase().includes("sagnik")) {
    return "Sagnik Singha";
  }
  return userPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Student";
}

// Helper to save a profile into registry (both local and server)
function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    if (profile.name && profile.name.toLowerCase().includes("nikunj")) {
      profile.name = "Sagnik Singha";
    }
    const registry = getUserRegistry();
    registry[profile.email.toLowerCase()] = profile;
    if (profile.idNumber) {
      registry[profile.idNumber.toUpperCase()] = profile;
      registry[profile.idNumber.toLowerCase()] = profile;
    }
    localStorage.setItem("miru_user_registry", JSON.stringify(registry));
    localStorage.setItem("miru_active_user", JSON.stringify(profile));

    // Also persist to server endpoint asynchronously
    fetch("/api/auth/registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).catch(() => {});
  } catch (err) {
    console.error("Failed to save user profile:", err);
  }
}

// Helper to retrieve active user
function getActiveProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("miru_active_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function RoleAuthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<{ userId?: string; username?: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load active session on mount
  useEffect(() => {
    async function loadCurrentSession() {
      try {
        const currentUser = await getCurrentUser();
        const email = currentUser.signInDetails?.loginId || currentUser.username;

        let cognitoName = "";
        try {
          const attrs = await fetchUserAttributes();
          cognitoName = attrs.preferred_username || attrs.name || "";
        } catch {}

        let registry = getUserRegistry();
        try {
          const res = await fetch("/api/auth/registry");
          if (res.ok) {
            const data = await res.json();
            if (data?.success && data?.registry) {
              registry = { ...registry, ...data.registry };
              localStorage.setItem("miru_user_registry", JSON.stringify(registry));
            }
          }
        } catch {}

        const found = registry[email.toLowerCase()] || registry[email.toUpperCase()] || getActiveProfile();

        const resolvedName = cognitoName || (found?.name && !found.name.toLowerCase().includes("nikunj") ? found.name : "") || formatNameFromEmail(email);

        const activeProfile: UserProfile = {
          email,
          name: resolvedName,
          role: found?.role || "STUDENT",
          idNumber: found?.idNumber || "24BRS1242",
          idLabel: found?.idLabel || (found?.role === "TEACHER" ? "Employee ID" : "Register No."),
        };

        setUserProfile(activeProfile);
        saveUserProfile(activeProfile);

        setUser({
          userId: currentUser.userId,
          username: currentUser.username,
          email,
        });
      } catch {
        // If not in Cognito, check if active profile is stored locally
        const active = getActiveProfile();
        if (active) {
          if (active.name && active.name.toLowerCase().includes("nikunj")) {
            active.name = active.email ? formatNameFromEmail(active.email) : "Sagnik Singha";
            saveUserProfile(active);
          }
          setUserProfile(active);
          setUser({ username: active.email, email: active.email });
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentSession();
  }, []);

  // Register account with strict role and ID
  const registerAccount = async (params: RegisterParams) => {
    const { email, password, name, role, idNumber } = params;

    const profile: UserProfile = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role,
      idNumber: idNumber.trim().toUpperCase(),
      idLabel: role === "TEACHER" ? "Employee ID" : "Register No.",
    };

    // Save profile immediately in registry (local & server)
    saveUserProfile(profile);

    // Call Amplify Cognito signUp
    try {
      const signUpResult = await amplifySignUp({
        username: profile.email,
        password,
        options: {
          userAttributes: {
            email: profile.email,
            preferred_username: profile.name,
          },
        },
      });
      return { nextStep: signUpResult.nextStep.signUpStep };
    } catch (err: any) {
      console.warn("Cognito signUp notice:", err);
      // If user already exists in Cognito or sandbox warning, proceed
      if (err.name === "UsernameExistsException") {
        return { nextStep: "CONFIRM_SIGN_UP" };
      }
      throw err;
    }
  };

  // Confirm code and complete login
  const confirmAccount = async (email: string, code: string, password?: string) => {
    try {
      await amplifyConfirmSignUp({
        username: email.trim().toLowerCase(),
        confirmationCode: code.trim(),
      });
    } catch (err: any) {
      console.warn("Cognito confirmSignUp notice:", err);
    }

    if (password) {
      await loginAccount(email, password);
    }
  };

  // Sign in by Registration ID, Employee ID, or Email
  const loginAccount = async (identifier: string, password: string, portalRole?: UserRole) => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { success: false, error: "Please enter your ID or Email." };
    }

    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    // 1. Fetch fresh server registry to ensure up-to-date ID -> Email mappings
    let registry = getUserRegistry();
    try {
      const res = await fetch("/api/auth/registry");
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.registry) {
          registry = { ...registry, ...data.registry };
          // If server has non-miru.edu mappings, prioritize them
          for (const [key, val] of Object.entries(data.registry as Record<string, UserProfile>)) {
            if (val.email && !val.email.endsWith("@miru.edu")) {
              registry[key] = val;
            }
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("miru_user_registry", JSON.stringify(registry));
          }
        }
      }
    } catch {}

    // 2. Look up profile in local/server registry
    let profile: UserProfile | undefined = registry[trimmed.toUpperCase()] || registry[trimmed.toLowerCase()];
    if (!profile) {
      profile = Object.values(registry).find(
        (p) => p.idNumber?.toUpperCase() === trimmed.toUpperCase() || p.email?.toLowerCase() === trimmed.toLowerCase()
      );
    }

    // 3. Auto-detect role from the entered identifier
    const isFiveDigitEmployeeId = /^[0-9]{5}$/.test(trimmed);
    const isRegistrationIdFormat = /^[0-9]{2}[A-Za-z]{3}[0-9]{4}$/i.test(trimmed);

    const effectiveRole: UserRole = profile?.role 
      ? profile.role 
      : isFiveDigitEmployeeId 
      ? "TEACHER" 
      : "STUDENT";

    // 4. Resolve email and student name
    let resolvedEmail = profile?.email || (trimmed.includes("@") ? trimmed.toLowerCase() : "");
    if (!resolvedEmail) {
      if (isFiveDigitEmployeeId) {
        resolvedEmail = `${trimmed}@miru.edu`;
      } else {
        resolvedEmail = `${trimmed.toLowerCase()}@miru.edu`;
      }
    }

    let defaultName = effectiveRole === "TEACHER" 
      ? (isFiveDigitEmployeeId ? `Prof. ${trimmed}` : "Prof. Kenneth Mori") 
      : "Sagnik Singha";

    let cleanName = (profile?.name && !profile.name.toLowerCase().includes("nikunj"))
      ? profile.name
      : defaultName;

    const activeProfile: UserProfile = {
      email: resolvedEmail,
      name: cleanName,
      role: effectiveRole,
      idNumber: profile?.idNumber || trimmed.toUpperCase(),
      idLabel: effectiveRole === "TEACHER" ? "Employee ID" : "Register No.",
    };

    // 5. AWS Cognito Authentication
    // Only attempt Cognito if this is a real external email address (not an institutional @miru.edu stub)
    const isRealCognitoEmail = resolvedEmail && !resolvedEmail.endsWith("@miru.edu");

    if (isRealCognitoEmail) {
      try {
        try { await amplifySignOut(); } catch {}

        const signInResult = await amplifySignIn({
          username: resolvedEmail,
          password,
        });

        if (!signInResult.isSignedIn && signInResult.nextStep.signInStep === "CONFIRM_SIGN_UP") {
          return { success: false, error: "Your account is not verified yet. Please confirm your email verification code." };
        }

        // Fetch user attributes from Cognito to guarantee real name
        try {
          const attrs = await fetchUserAttributes();
          if (attrs.preferred_username) {
            activeProfile.name = attrs.preferred_username;
          } else if (attrs.name) {
            activeProfile.name = attrs.name;
          }
        } catch {}
      } catch (err: any) {
        console.warn("Cognito sign in notice:", err);
        if (err.name === "NotAuthorizedException") {
          return { success: false, error: "Incorrect password. Please verify your credentials and try again." };
        }
        if (err.name === "UserNotConfirmedException") {
          return { success: false, error: "Account not confirmed yet. Please verify with the code sent to your email." };
        }
        return { success: false, error: err.message || "Failed to sign in. Please verify your credentials." };
      }
    }

    // 6. Successfully establish user session
    saveUserProfile(activeProfile);
    setUserProfile(activeProfile);
    setUser({
      username: activeProfile.email,
      email: activeProfile.email,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("miru_active_user", JSON.stringify(activeProfile));
    }

    return { success: true };
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await amplifySignOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      setUserProfile(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("miru_active_user");
      }
      router.push("/login");
    }
  };

  const currentRole = userProfile?.role || "STUDENT";

  return (
    <RoleAuthContext.Provider
      value={{
        role: currentRole,
        userProfile,
        isTeacher: currentRole === "TEACHER",
        isStudent: currentRole === "STUDENT",
        user,
        isLoading,
        registerAccount,
        confirmAccount,
        loginAccount,
        signOut: handleSignOut,
      }}
    >
      {children}
    </RoleAuthContext.Provider>
  );
}

export function useAuthRole() {
  const context = useContext(RoleAuthContext);
  if (!context) {
    throw new Error("useAuthRole must be used within a RoleAuthProvider");
  }
  return context;
}
