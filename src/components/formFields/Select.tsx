import React from 'react';

import FormFieldDescription from './FormFieldDescription';
import FormFieldErrorHint from './FormFieldErrorHint';
// import FormFieldLabel from './FormFieldLabel';
import { Label } from './Label';

// import FormField from './FormField';

type SelectProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  inputProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
  label?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readonly?: boolean;
  options: { code: string | number; label: string }[] | string[];
  type?:
    | 'text'
    | 'password'
    | 'email'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'file';
  optional?: boolean;
  value?: string;
  accept?: string;
  bordered?: boolean;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  tooltipText?: string;
  overlapLabel?: string;
};

function Select({
  className = '',
  description,
  disabled,
  error,
  errorMessage,
  icon,
  inputProps = {},
  label,
  name,
  onChange,
  readonly,
  optional,
  iconEnd,
  options,
  tooltipText,
  overlapLabel,
}: SelectProps) {
  return (
    // <FormField className={className}>
    <>
      {label && (
        <Label optional={optional} tooltipText={tooltipText}>
          {label}
        </Label>
      )}

      {description && (
        <FormFieldDescription>{description}</FormFieldDescription>
      )}
      <div className="mt-1 w-full relative" onChange={onChange}>
        {icon && (
          <div className="absolute translate-y-[-50%] top-1/2 translate-x-1/2 text-primary-600">
            {icon}
          </div>
        )}

        <select
          id={name}
          name={name}
          // style={additionalStyling}
          // placeholder={placeholder}
          // readOnly={readonly}
          disabled={disabled}
          className={`w-full bg-inherit relative rounded-md border-border-gray shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : ''
          } ${readonly ? 'input-disabled' : ''} ${
            disabled ? 'border-1 border-neutral' : ''
          } ${className} ${iconEnd ? 'pr-10' : ''}`}
          // value={value}
          defaultValue={''}
          {...inputProps}
        >
          <option disabled value=""></option>
          {options.map((option) => (
            <React.Fragment
              key={typeof option === 'string' ? option : option.code}
            >
              {typeof option === 'string' ? (
                <>
                  <option value={option}>{option}</option>{' '}
                </>
              ) : (
                <>
                  <option key={option.code} value={option?.code}>
                    {option.label}
                  </option>
                </>
              )}
            </React.Fragment>
          ))}
        </select>
        {overlapLabel && (
          <label
            htmlFor="name"
            className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-neutral-content"
          >
            {overlapLabel}
          </label>
        )}

        {iconEnd && (
          <div className="absolute translate-y-[-50%] top-1/2 translate-x-1/4 text-primary-600 right-2 pr-2">
            {iconEnd}
          </div>
        )}
      </div>
      {error && errorMessage && (
        <FormFieldErrorHint>{errorMessage}</FormFieldErrorHint>
      )}
    </>

    // </FormField>
  );
}

export default Select;
