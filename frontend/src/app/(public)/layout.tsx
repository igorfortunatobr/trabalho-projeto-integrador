import { FloatingNavbar } from "@/components/layout/floating-navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FloatingNavbar />
      {children}
    </>
  );
}
