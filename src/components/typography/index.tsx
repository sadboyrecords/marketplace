import React from 'react';

type TypographyProps = {
  loading?: boolean;
  type?: 'h1' | 'h2' | 'p' | 'span' | 'div' | 'label' | 'button' | 'a';
  children: React.ReactNode;
  className?: string;
  color?:
    | 'primary'
    | 'secondary'
    | 'neutral'
    | 'accent'
    | 'neutral'
    | 'error'
    | 'warning'
    | 'base'
    | 'success'
    | 'neutral-content'
    | 'neutral-gray'
    | 'inherit';
  size?:
    | 'display-2xl'
    | 'display-xl'
    | 'display-lg'
    | 'display-md'
    | 'display-sm'
    | 'display-xs'
    | 'body'
    | 'body-xl'
    | 'body-lg'
    | 'body-sm'
    | 'body-xs';
  // weight: "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold";
};

function Typography({
  type: Tag = 'p',
  children,
  className,
  color = 'base',
  size = 'body',
  loading = false,
}: // weight,
TypographyProps) {
  const sizeClasses = {
    'display-2xl': 'text-[4.5rem] leading-[5.625rem]', //7xl
    'display-xl': 'text-[3.75rem ] leading-[4.5rem]', //6xl 3.75rem - 0.025vw
    'display-lg': 'text-[3rem] leading-[3.75rem]', //5xl
    'display-md': 'text-[calc(2rem+0.25vw)] leading-[2.75rem]', // 2.254xl
    'display-sm': 'text-[1.875rem] leading-[2.375rem]', //3xl
    'display-xs': 'text-[1.5rem] leading-[2rem]', //2xl
    'body-xl': 'text-xl leading-[1.875rem]',
    'body-lg': 'text-lg',
    body: 'text-base', // regular
    'body-sm': 'text-sm',
    'body-xs': 'text-xs',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    neutral: 'text-neutral',
    error: 'text-error-500',
    warning: 'text-warning-500',
    base: 'text-base-content',
    success: 'text-success-500',
    'neutral-content': 'text-neutral-content',
    'neutral-gray': 'text-gray-neutral',
    inherit: 'text-inherit',
  };
  return (
    <Tag
      className={` ${colorClasses[color]} ${sizeClasses[size]} ${
        loading ? 'animate-pulse bg-neutral-content w-full h-4' : ''
      }  ${className ? className : ''} `}
    >
      {!loading && children}
    </Tag>
  );
}

export default Typography;
