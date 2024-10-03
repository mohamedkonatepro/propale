import React, { useState } from "react";

interface SwitchButtonProps {
  onChange?: (isAnnual: boolean) => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({ onChange }) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  const handleClick = () => {
    setIsAnnual(!isAnnual);
    if (onChange) {
      onChange(!isAnnual);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-[280px] h-[46px] bg-white border border-slate-200 rounded-full flex items-center justify-between overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
    >
      <div
        className={`absolute top-0 bottom-0 ${
          isAnnual ? "left-[125px] w-[150px]" : "left-0 w-[125px]"
        } bg-gray-900 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center`}
      >
        <span className="text-white font-bold">
          {isAnnual ? "Annuel (-10%)" : "Mensuel"}
        </span>
      </div>
      <div className={`absolute ${isAnnual ? "left-5" : "right-5"} flex items-center space-x-2 transition-all duration-300 ease-in-out`}>
        <span className="text-slate-400 text-sm">
          {isAnnual ? "Mensuel" : "Annuel (-10%)"}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transform ${isAnnual ? "rotate-180" : "rotate-0"} transition-transform duration-300 ease-in-out`}
        >
          <path
            d="M7.5 15L12.5 10L7.5 5"
            stroke="#97A6BA"
            strokeWidth="1.67"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
};

export default SwitchButton;
