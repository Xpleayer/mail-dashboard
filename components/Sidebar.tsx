"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/clients", label: "Clients", icon: "👤" },
  { href: "/compose", label: "Compose", icon: "✉" },
  { href: "/reminders", label: "Reminders", icon: "🔔" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-3 shrink-0">
      <div className="px-3 mb-8">
        <span className="text-lg font-semibold tracking-tight text-white">
          Mailboard
        </span>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mx-3 mt-4 text-left text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        Sign out
      </button>
    </aside>
  );
}
