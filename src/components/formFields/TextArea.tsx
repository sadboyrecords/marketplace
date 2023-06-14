import React from 'react';

import FormFieldDescription from './FormFieldDescription';
import FormFieldErrorHint from './FormFieldErrorHint';
// import FormFieldLabel from "./FormFieldLabel";
import { Label } from './Label';

type TInputProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  inputProps?: React.InputHTMLAttributes<HTMLTextAreaElement>;
  label?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readonly?: boolean;
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
  rows?: number;
  tooltipText?: string;
  overlapLabel?: string;
};

function TextArea({
  description,
  disabled,
  error,
  errorMessage,
  inputProps = {},
  label,
  name,
  onChange,
  placeholder,
  readonly,
  optional,
  type = 'text',
  value,
  rows = 3,
  tooltipText,
  overlapLabel,
}: TInputProps) {
  return (
    <div>
      {label && (
        <Label tooltipText={tooltipText} optional={optional}>
          {label}
        </Label>
      )}

      {description && (
        <FormFieldDescription>{description}</FormFieldDescription>
      )}
      <div className="relative">
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          onChange={onChange}
          type={type}
          className={`mt-1 bg-inherit relative resize-none rounded-md border-border-gray shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm  w-full ${
            error ? 'input-error' : ''
          }`}
          readOnly={readonly}
          disabled={disabled}
          {...inputProps}
          value={value}
        />
        {overlapLabel && (
          // -top-2 left-2 -mt-px
          <label
            htmlFor="name"
            className="absolute -top-1 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-neutral-content"
          >
            {overlapLabel}
          </label>
        )}
      </div>

      {error && errorMessage && (
        <FormFieldErrorHint>{errorMessage}</FormFieldErrorHint>
      )}
    </div>
  );
}

export default TextArea;
