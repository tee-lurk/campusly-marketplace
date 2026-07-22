import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, icon, color = "text-brand-indigo" }: StatCardProps) {
  return (
    <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-xl p-5 flex flex-col gap-2">
      {icon && (
        <div className={`${color} opacity-80`}>{icon}</div>
      )}
      <div className={`text-3xl font-bold font-heading ${color}`}>{value}</div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
}
