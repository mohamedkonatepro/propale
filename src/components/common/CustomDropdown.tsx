import React, { useRef } from 'react';
import { IconType } from 'react-icons/lib';
import clsx from 'clsx';
import { Color } from '@/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu';

type Option = {
  label: string;
  value: string;
  color: Color;
  icon?: IconType;
};

interface CustomDropdownProps {
  options: Option[];
  label: string;
  selected: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blueCustom',
    border: 'border-blueCustom',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-600',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-600',
  },
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, label, selected, onChange, disabled = false }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selected) || options[0];
  const selectedColorClasses = colorClasses[selectedOption.color];

  const handleOptionClick = (option: Option) => {
    if (!disabled) {
      onChange(option.value);
    }
  };

  return (
    <DropdownMenu>
      <div className="w-full relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-black mb-2">{label}</label>
        <DropdownMenuTrigger
          disabled={disabled} // Disable the trigger if disabled is true
          className={clsx(
            'text-sm px-5 py-1 rounded-full flex items-center justify-between cursor-pointer',
            selectedColorClasses.bg,
            selectedColorClasses.text,
            selectedColorClasses.border,
            'border',
            disabled && 'cursor-not-allowed opacity-50' // Add styles when disabled
          )}
        >
          {selectedOption.label}
          {selectedOption.icon && <selectedOption.icon className="ml-2" />}
        </DropdownMenuTrigger>
        {!disabled && (
          <DropdownMenuContent className="bg-white border border-blueCustom rounded-lg mt-2 w-full">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className="cursor-pointer px-4 py-2 hover:bg-blue-100"
              >
                <div className="text-sm flex items-center justify-between">
                  {option.label}
                  {option.icon && <option.icon className="ml-2" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </div>
    </DropdownMenu>
  );
};

export default CustomDropdown;
