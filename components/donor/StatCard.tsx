import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
}

export function StatCard({ icon, label, value, href }: StatCardProps) {
  const inner = (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex items-start gap-4 w-full hover:border-gray-300 dark:hover:border-white/20 transition-colors">
      <div className="p-2.5 bg-gray-100 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 dark:text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-black dark:text-white">{value}</p>
      </div>
    </div>
  );

  if (href) return <a href={href} className="block">{inner}</a>;
  return inner;
}
