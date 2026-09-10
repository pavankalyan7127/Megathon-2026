import React from 'react';

export default function QuickActionCards({ actions = [], onSelectAction, disabled }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Quick Actions
        </h3>
        <span className="text-xs text-gray-500">Click a card to prepare prompt</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.prompt)}
            disabled={disabled}
            className="flex flex-col text-left p-3.5 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/40 transition-colors disabled:opacity-50"
          >
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {action.label}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              "{action.prompt}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

