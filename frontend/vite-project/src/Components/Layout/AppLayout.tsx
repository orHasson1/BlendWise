import React, { ReactNode } from "react";
import TopNavbar from "./TopNavbar";
import SideNavbar from "./SideNavbar";

interface AppLayoutProps {
  children: ReactNode;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, isLoggedIn, onLogout, onLoginClick }) => {
  const sideLinks = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <>
      <TopNavbar isLoggedIn={isLoggedIn} onLogout={onLogout} onLoginClick={onLoginClick} />
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
        <aside className="hidden md:block w-56 border-r border-slate-200 bg-white/70 backdrop-blur">
          <SideNavbar links={sideLinks} />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
};

export default AppLayout;
