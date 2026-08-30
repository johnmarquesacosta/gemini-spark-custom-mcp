import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-10 pb-6 border-b border-rule flex items-end justify-between">
      <div className="flex gap-4 items-center">
        <div className="w-1.5 h-10 bg-crimson" aria-hidden="true" />
        <div>
          <h2 className="text-4xl font-serif font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-widest">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
