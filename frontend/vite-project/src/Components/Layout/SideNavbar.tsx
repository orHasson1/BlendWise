import React from "react";

interface SideNavbarProps {
  links: { label: string; href: string }[];
}

const SideNavbar: React.FC<SideNavbarProps> = ({ links }) => {
  return (
    <nav className="h-full p-4">
      <ul className="space-y-1 text-sm">
        {links.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className="flex items-center rounded-md px-3 py-2 text-slate-600 hover:text-brand hover:bg-slate-100 transition"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNavbar;
