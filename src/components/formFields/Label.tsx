import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

export function Label({
  children,
  className = '',
  htmlFor,
  optional,
  tooltipText,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  optional?: boolean;
  tooltipText?: string;
}) {
  return (
    // text-gray-900
    // text-gray-700
    <label
      className={`block text-sm font-medium text-base-content leading-6 ${className}`}
      htmlFor={htmlFor}
    >
      {children}
      {optional && ' (optional)'}
      <div
        className={`tooltip ${tooltipText ? 'block' : 'hidden'}`}
        data-tip={tooltipText}
      >
        <InformationCircleIcon className="w-5 h-5 ml-2 text-info " />
      </div>
    </label>
  );
}
