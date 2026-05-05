"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

const navItem = [
    { label: "Dashboard",          href: "/" },
    { label: "New Form (QR)",      href: "/qr" },
    { label: "Unverified",         href: "/?status=pending" },
    { label: "Verified",           href: "/?status=verified" },
    { label: "Accepted",           href: "/?status=approved" },
    { label: "Donated",            href: "/?status=donated" },
    { label: "Issued",             href: "/?status=issued" },
    { label: "Rejected",           href: "/?status=rejected" },
    { label: "Upcoming Birthdays", href: "/?status=birthdays" },
];

export default function Sidebar(){
    const [active, setActive] = useState("Dashboard");
    const { logout } = useAuth();

    return(
        <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-black text-black dark:text-white border-r border-gray-200 dark:border-white/10 transition-colors duration-200">
            <div className="flex p-6 font-bold gap-2 text-xl  dark:border-white/10 items-center justify-center text-center">
                <Image src="/logo.png" alt="logo" width={200} height={200} className="mix-blend-multiply dark:mix-blend-screen object-cover object-[center_20%]" />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItem.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setActive(item.label)}
                        className={`block w-full px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                        ${active === item.label
                            ? "bg-gray-200 dark:bg-white/10 text-black dark:text-white"
                            : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-white/10 mt-auto flex items-center justify-between gap-2">
  <button
    onClick={logout}
    className="flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-[#111] hover:text-black dark:hover:text-white transition-all duration-200"
  >
    <LogOut className="w-5 h-5" />
    Logout
  </button>
  <ThemeToggle />
</div>
        </div>
    );
}