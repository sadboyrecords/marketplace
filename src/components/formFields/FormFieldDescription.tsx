import React from 'react';

function FormFieldDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    // ml-half
    // text-gray-500
    <p className={`mt-1 text-[12px] text-neutral-content  ${className}`}>
      {children}
    </p>
  );
}

export default FormFieldDescription;
