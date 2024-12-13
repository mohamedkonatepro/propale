import React from "react";
import { RiArrowRightSLine } from "react-icons/ri";
import { IoMdCheckmark } from "react-icons/io";

type Step = {
  label: string;
  completed: boolean;
  active: boolean;
};

type StepperStatusProps = {
  steps: Step[];
};

const StepperStatus: React.FC<StepperStatusProps> = ({ steps }) => {
  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-2">
          {/* Step Box */}
          <div
            className={`flex items-center justify-center rounded-lg text-sm font-medium
              w-36 h-8 px-4 py-2 lg:w-32 lg:h-7 lg:px-3 lg:py-1.5
              ${
                step.active
                  ? "bg-blue-100 text-blueCustom border border-blueCustom"
                  : step.completed
                  ? "bg-green-100 text-green-500 border border-green-500"
                  : "bg-gray-100 text-gray-400 border border-gray-300"
              }`}
          >
            {step.label}
            {step.completed && (
              <IoMdCheckmark className="ml-2 w-5 h-5 lg:w-4 lg:h-4 text-green-500" />
            )}
          </div>

          {/* Arrow */}
          {index < steps.length - 1 && (
            <RiArrowRightSLine className="w-8 h-8 text-gray-400 lg:w-6 lg:h-6" />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepperStatus;
