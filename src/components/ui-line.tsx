"use client";

import { ReactNode } from "react";

interface SettingRowProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SettingRow({ title, description, action }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
