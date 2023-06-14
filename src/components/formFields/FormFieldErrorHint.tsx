import React from 'react';

function FormFieldErrorHint({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className="label ml-half">
      <span className={`label-text-alt text-xs text-error-500 ${className}`}>
        {children}
      </span>
    </label>
  );
}

export default FormFieldErrorHint;
