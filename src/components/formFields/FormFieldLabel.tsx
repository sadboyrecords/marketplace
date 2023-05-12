import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import { Label } from "./Label";

function FormFieldLabel({
  children,
  className = "",
  optional,
  bottomMargin = true,
  tooltipText,
}: {
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
  bottomMargin?: boolean;
  tooltip?: boolean;
  tooltipText?: string;
  info?: string;
}) {
  return (
    <Label
      className={`text-[15px] font-normal text-base-content ${
        bottomMargin ? "mb-1" : ""
      }  ml-half ${className}`}
    >
      <div className="flex">
        {children}
        {optional && " (optional)"}
        <div
          className={`tooltip ${tooltipText ? "block" : "hidden"}`}
          data-tip={tooltipText}
        >
          <InformationCircleIcon className="ml-2 h-5 w-5 text-info " />
        </div>
      </div>

      {/* <span className="ml-half text-error">*</span> */}
    </Label>
  );
}

export default FormFieldLabel;
