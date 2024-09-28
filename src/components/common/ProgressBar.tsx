import React from 'react';

interface ProgressBarProps {
  percentage: number;
  backgroundColor?: string;
  progressColor?: string;
  height?: string;
  roundedClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  backgroundColor = 'bg-gray-200',
  progressColor = 'bg-blueCustom',
  height = 'h-2.5',
  roundedClass = 'rounded-b-3xl',
}) => (
  <div className={`w-full ${backgroundColor} ${roundedClass} ${height} mb-4 dark:bg-gray-700`}>
    <div 
      className={`${progressColor} ${height} ${percentage === 100 ? 'rounded-b-full' : 'rounded-bl-full'} dark:bg-blueCustom`} 
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

export default ProgressBar;
