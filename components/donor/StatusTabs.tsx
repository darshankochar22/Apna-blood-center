"use client";

import { useRouter } from "next/navigation";
import { TABS } from "./constants";

interface StatusTabsProps {
  statusFilter: string | null;
  stats: Record<string, number> | null;
}

export function StatusTabs({ statusFilter, stats }: StatusTabsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {TABS.map(tab => {
        const isActive = statusFilter === tab.value || (!statusFilter && tab.value === null);
        const count = tab.statKey && stats ? stats[tab.statKey] : null;

        return (
          <button
            key={tab.label}
            onClick={() => router.push(tab.value ? `/?status=${tab.value}` : "/")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                : "text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab.label}
            {count != null && (
              <span className={`min-w-[20px] text-center text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? "bg-white/25 dark:bg-black/30 text-white dark:text-black"
                  : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/50"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
