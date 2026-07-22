import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      {icon && (
        <div className="text-text-muted mb-4 opacity-60">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-200 font-heading mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
