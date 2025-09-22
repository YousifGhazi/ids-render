"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store";

interface AuthWrapperProps {
  children: ReactNode;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login"];

function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix to check the actual route
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
  return PUBLIC_ROUTES.includes(pathWithoutLocale);
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthed, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for the store to rehydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Don't check auth until store is hydrated
    if (!isHydrated) return;
    
    // Skip auth check for public routes
    if (isPublicRoute(pathname)) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthed || !token) {
      router.push("/login");
    }
  }, [isAuthed, token, pathname, router, isHydrated]);

  // Don't render anything until store is hydrated
  if (!isHydrated) {
    return null;
  }

  // For public routes, always show content
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, only show content if authenticated
  if (isAuthed && token) {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  return null;
}
