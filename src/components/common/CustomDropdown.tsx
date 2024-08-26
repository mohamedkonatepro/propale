import React, { useState, useRef, useEffect } from 'react';
import { IconType } from 'react-icons/lib';
import clsx from 'clsx';
import { Color } from '@/constants'; // Import the Color type

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

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, label, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selected) || options[0];
  const selectedColorClasses = colorClasses[selectedOption.color];

  const handleToggle = () => setIsOpen(!isOpen);
  const handleOptionClick = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-black">{label}</label>
      <div
        onClick={handleToggle}
        className={clsx(
          'text-sm px-5 py-1 rounded-full mt-1 flex items-center justify-between cursor-pointer',
          selectedColorClasses.bg,
          selectedColorClasses.text,
          selectedColorClasses.border,
          'border'
        )}
      >
        {selectedOption.label}
        {selectedOption.icon && <selectedOption.icon className="ml-2" />}
      </div>
      {isOpen && (
        <ul className="absolute z-10 bg-white border border-blueCustom rounded-lg mt-2 w-full">
          {options.map((option) => (
            <li key={option.value} onClick={() => handleOptionClick(option)} className="px-5 py-1 cursor-pointer hover:bg-blue-100 w-full">
              <div className="text-sm flex items-center justify-between">
                {option.label}
                {option.icon && <option.icon className="ml-2" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
