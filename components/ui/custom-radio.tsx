"use client";

import * as React from "react";
import { Check } from "lucide-react";

interface CustomRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function CustomRadioGroup({
  value,
  onValueChange,
  disabled = false,
  children,
}: CustomRadioGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            groupValue: value,
            onGroupChange: onValueChange,
            groupDisabled: disabled,
          });
        }
        return child;
      })}
    </div>
  );
}

interface CustomRadioItemProps {
  value: string;
  id: string;
  label: string;
  groupValue?: string;
  onGroupChange?: (value: string) => void;
  groupDisabled?: boolean;
}

export function CustomRadioItem({
  value,
  id,
  label,
  groupValue,
  onGroupChange,
  groupDisabled = false,
}: CustomRadioItemProps) {
  const isSelected = groupValue === value;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        id={id}
        role="radio"
        aria-checked={isSelected}
        disabled={groupDisabled}
        onClick={() => onGroupChange?.(value)}
        className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          groupDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{
          backgroundColor: isSelected ? "rgb(82, 168, 255)" : "rgb(69, 69, 69)",
        }}
      >
        {isSelected && (
          <Check
            className="w-3 h-3"
            style={{ color: "rgb(10, 10, 10)" }}
            strokeWidth={3}
          />
        )}
      </button>
      <label
        htmlFor={id}
        className={`text-sm sm:text-base cursor-pointer transition-colors ${
          groupDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{
          color: isSelected ? "rgb(255, 255, 255)" : "rgb(136, 136, 136)",
        }}
        onClick={(e) => {
          if (!groupDisabled) {
            e.preventDefault();
            onGroupChange?.(value);
          }
        }}
      >
        {label}
      </label>
    </div>
  );
}
