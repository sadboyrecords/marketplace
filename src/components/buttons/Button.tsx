// import { forwardRef } from "react";

type ButtonProps = {
  as?: "button" | "a";
  variant?: "contained" | "ghost" | "outlined";
  color?: "primary" | "secondary" | "neutral" | "error";
  rounded?: "md" | "full";
  size?: "sm" | "md" | "lg" | "base";
  href?: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "submit" | "button" | "reset";
  onClick?: () =>
    | Promise<unknown>
    | (React.MouseEventHandler<HTMLButtonElement> &
        React.MouseEventHandler<HTMLAnchorElement>);
  //   ref: React.
  click?: () => void;
  click2?: () => Promise<void>;
  // () => Promise<void>
};

function Button({
  as: Tag = "button",
  variant = "contained",
  color = "primary",
  rounded = "md",
  href,
  children,
  loading,
  className,
  disabled,
  size = "md",
  onClick,
  type = "button",
  ...props
}: ButtonProps) {
  const variantClasses = {
    contained: {
      // hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
      primary:
        "border border-transparent bg-primary-600 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:border-primary-200 disabled:text-base-100",
      secondary:
        "border border-transparent bg-primary-600 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      neutral:
        "border border-transparent bg-primary-600 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      error:
        "border border-transparent bg-error-600 text-sm text-white hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:border-error-200 disabled:text-base-100",
    },
    outlined: {
      primary:
        "border border-primary-600 hover:border-primary-800 text-primary-600 hover:text-primary-800",
      secondary: "border border-gray-300",
      // border-gray-300 text-gray-700
      neutral:
        "border border-gray-300 text-gray-700 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      error:
        "border border-error-600 hover:border-error-800 text-error-600 hover:text-error-800",
    },
    ghost: {
      primary:
        "bg-inherit hover:bg-inherit border-0 text-sm  text-primary-600 hover:text-primary-600",
      secondary:
        "bg-inherit hover:bg-inherit border-0  text-base text-secondary-600",
      neutral:
        "bg-inherit hover:bg-inherit border-0  text-gray-400 hover:text-gray-500 ",
      error:
        "bg-inherit hover:bg-inherit border-0 text-sm  text-error-600 hover:text-error-600",
    },
  };

  //   ${Tag === "a" ? "hover:underline" : ""} -save for links
  //   const sizeClasses

  const roundedClasses = {
    md: "rounded-md ",
    full: "rounded-full",
  };

  const sizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm ",
    md: " px-4 py-2 text-sm ",
    base: "px-4 py-2 text-base font-medium",
    lg: "px-6 py-3 text-base",
  };

  return (
    <Tag
      type={type}
      className={`${
        loading ? "loading btn" : ""
      } inline-flex cursor-pointer items-center justify-center font-medium shadow-sm  ${
        variantClasses[variant][color]
      } ${roundedClasses[rounded]} ${sizeClasses[size]} ${
        disabled ? "!btn-disabled" : ""
      }  ${className ? className : ""} `}
      href={href}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
      {/* <span className={` ${loading ? "hidden" : "visible"}`}>{children}</span> */}
    </Tag>
  );
}

// export default forwardRef(Button);
export default Button;

// function Button(
//     {
//       as: Tag = 'button',
//       size = 'sm',
//       variant = 'primary', // secondary, outline
//       fullWidth = false,
//       children,
//       className = '',
//       loading = false,
//       disabled = false,
//       submit = false,
//       roundedFull = false,
//       ...props
//     },
//     ref,
//   ) {
//     const sizeClasses = {
//       xs: 'btn-xs',
//       sm: 'btn-sm',
//       md: 'btn-md text-[1.125rem]',
//       lg: 'btn-lg',
//       xl: 'btn-lg text-[1.5rem] sm:text-[2rem]',
//     };
//     const variantClasses = {
//       primary:
//         'btn-primary disabled:bg-primary-200 disabled:border-primary-200 disabled:text-base-100',
//       secondary: 'btn-secondary',
//       outline: 'btn-outline border-base-300 text-neutral ',
//       'primary-outline': 'btn-primary btn-outline',
//       primaryLight:
//         'btn-primary bg-primary-100 disabled:bg-primary-200 disabled:border-primary-200 disabled:text-base-100  border-opacity-10 text-primary hover:bg-primary-400 hover:text-white hover:border-primary-100 font-light',
//       primaryLightDarkBg:
//         'disabled:border-primary-200 disabled:text-base-100 bg-opacity-20 border-opacity-10 bg-primary-400 text-white border-primary-100  hover:bg-primary-400 hover:text-white hover:border-primary-100 font-bold',
//       // text-primary  btn-primary disabled:bg-primary-200
//     };
//     return (
//       <Tag
//         className={`relative btn  font-semibold normal-case ${
//           roundedFull ? 'rounded-full' : 'rounded'
//         } ${fullWidth ? 'w-full' : 'min-w-[8.75rem]'} ${
//           variantClasses[variant]
//         } ${sizeClasses[size]} ${className}`}
//         ref={ref}
//         disabled={disabled}
//         {...(Tag === 'button' && { type: submit ? 'submit' : 'button' })}
//         {...props}
//       >
//         <span className={`flex items-center ${loading ? 'hidden' : 'visible'}`}>
//           {children}
//         </span>
//         {loading && (
//           <Loading className="absolute ml-1 h-[15px] w-[15px] inline" />
//         )}
//       </Tag>
//     );
//   }

//   export default forwardRef(Button);
