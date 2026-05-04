"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();

  // Public routes that don't require authentication or the sidebar
  if (pathname?.startsWith("/donate")) {
    return <>{children}</>;
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen">
      <div className="w-[15%] h-full border-r border-white/10 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="w-[85%] h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}