"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";
import { LogOut } from "lucide-react";

const navItem = [
    {label: "Dashboard", href:"/" },
    {label: "Unverified Donors", href:"/?status=pending" },
    {label: "Verified Donors", href:"/?status=verified" },
    {label: "Accepted Donors", href:"/?status=approved" },
    {label: "Rejected Donors", href:"/?status=rejected" },
    {label: "New Form (QR)", href:"/donate" },
];

export default function Sidebar(){
    const [active, setActive] = useState("Dashboard");
    const { logout } = useAuth();

    return(
        <div className="flex flex-col h-full bg-black text-white">
            <div className="flex p-6 font-bold gap-2 text-xl border-b border-white/10 items-center justify-center text-center">
                Apna Blood Center
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItem.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setActive(item.label)}
                        className={`block w-full px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                        ${active === item.label
                            ? "bg-white/10 text-white"
                            : "text-white/50 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-white/10 mt-auto">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide text-white/50 hover:bg-[#111] hover:text-white transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}