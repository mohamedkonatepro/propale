import React from 'react';
import clsx from 'clsx';
import { Color, Option } from '@/constants';
type BadgeProps = {
  label: string;
  color: Color;
  icon?: React.ReactNode;
};

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

const Badge: React.FC<BadgeProps> = ({ label, color, icon }) => {
  const selectedColorClasses = colorClasses[color];

  return (
    <div
      className={clsx(
        'text-xs px-5 py-1 rounded-full flex items-center justify-center',
        selectedColorClasses.bg,
        selectedColorClasses.text,
        selectedColorClasses.border,
        'border'
      )}
    >
      {label}
      {icon && <span className="ml-2">{icon}</span>}
    </div>
  );
};

export default Badge;
