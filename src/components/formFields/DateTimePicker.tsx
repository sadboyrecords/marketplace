import { forwardRef } from "react";
import FormFieldDescription from "./FormFieldDescription";
import FormFieldErrorHint from "./FormFieldErrorHint";
import FormFieldLabel from "./FormFieldLabel";
import FormField from "./FormField";
import ReactDatePicker from "react-datepicker";
// import addDays from 'date-fns/addDays';
// import subDays from 'date-fns/subDays';
import "react-datepicker/dist/react-datepicker.css";
// import { useState } from 'react';
// import { XCircleIcon } from '@heroicons/react/24/solid';
// import Input from './Input';
// import Typography from '../Typography';

type IDateTimePickerProps = {
  className?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string | null;
  label?: string;
  optional?: boolean;
  minDate?: Date;
  onChange: (date: Date) => void;
  value?: Date;
  startDateTime?: Date;
  timePickerTitle?: string;
  startDateInterval?: number;
  tooltip?: boolean;
  tooltipText?: string;
};

function DateTimePickerInput({
  className = "",
  description,
  error,
  errorMessage,
  label,
  optional,
  minDate = new Date(),
  onChange,
  value,
  startDateTime,
  timePickerTitle = "Time",
  startDateInterval = 0,
  tooltip,
  tooltipText,
}: IDateTimePickerProps) {
  return (
    <FormField className={`nifty-datepicker ${className}`}>
      <FormFieldLabel
        optional={optional}
        tooltip={tooltip}
        tooltipText={tooltipText}
      >
        {label}
      </FormFieldLabel>
      {description && (
        <FormFieldDescription>{description}</FormFieldDescription>
      )}
      {/* .nifty-datepicker .react-datepicker__month-container {
	@apply bg-base-100;
} */}
      <div className="relative">
        <ReactDatePicker
          minDate={minDate}
          customInput={
            <input className="input-bordered input mt-1 w-full max-w-full" />
          }
          // dateFormat="MMMM do, yyyy"
          dateFormat="MMM dd, yyyy h:mm aa"
          onChange={onChange}
          selected={value}
          // showTimeInput
          // timeInputLabel="Start Time:"
          showTimeSelect
          timeIntervals={15}
          timeCaption={timePickerTitle}
          isClearable
          //   excludeDateIntervals={[
          //     {
          //       start: startDateTime
          //         ? subDays(new Date(startDateTime), 400)
          //         : subDays(new Date(), startDateInterval),
          //       end: startDateTime
          //         ? addDays(new Date(startDateTime), 0)
          //         : addDays(new Date(), 0),
          //     },
          //   ]}
        />
      </div>

      {/* <Typography> Clear date </Typography> */}
      {error && errorMessage && (
        <FormFieldErrorHint>{errorMessage}</FormFieldErrorHint>
      )}
    </FormField>
  );
}

export default forwardRef(DateTimePickerInput);
