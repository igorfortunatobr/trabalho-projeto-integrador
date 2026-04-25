"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { getStoredToken } from "@/lib/auth";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getStoredToken();

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [pathname, router, token]);

  if (token) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Redirecionando para o sistema...
      </main>
    );
  }

  return (
    <>
      <FloatingNavbar />
      {children}
    </>
  );
}
