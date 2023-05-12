import React from 'react';

import FormFieldDescription from './FormFieldDescription';
import FormFieldErrorHint from './FormFieldErrorHint';

type TRadioCheckboxProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  label?: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readonly?: boolean;
  type: 'checkbox' | 'radio';
  value?: string;
  accept?: string;
  defaultChecked?: boolean;
  defaultValue?: string;
};

function RadioCheckbox({
  className = '',
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
  type = 'radio',
  value,
  accept = '',
  defaultChecked = false,
}: TRadioCheckboxProps) {
  const additionalStyling = {};

  const typeClass = {
    radio: 'h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500',
    checkbox: 'checkbox  checkbox-xs rounded-sm', //checkbox-primary
  };

  return (
    <div className="flex relative items-center" onChange={onChange}>
      <label className="label cursor-pointer flex p-1">
        <input
          name={name}
          style={additionalStyling}
          placeholder={placeholder}
          type={type}
          readOnly={readonly}
          disabled={disabled}
          className={`${typeClass[type]} ${error ? 'input-error' : ''} ${
            readonly ? 'input-disabled' : ''
          } ${disabled ? 'border-1 border-neutral' : ''} ${className}`}
          value={value}
          {...inputProps}
          accept={accept}
          defaultChecked={defaultChecked}
          // defaultValue={defaultValue}
        />
      </label>
      <div className="ml-2">
        <div className="text-sm"> {label}</div>
        {description && (
          <FormFieldDescription>{description}</FormFieldDescription>
        )}
        {error && errorMessage && (
          <FormFieldErrorHint>{errorMessage}</FormFieldErrorHint>
        )}
        {/* <FormFieldErrorHint>{errorMessage} test</FormFieldErrorHint> */}
      </div>
    </div>
  );
}

export default RadioCheckbox;
