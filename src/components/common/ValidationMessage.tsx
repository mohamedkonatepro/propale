import { FC } from 'react';
import { FaTimesCircle } from 'react-icons/fa';

interface ValidationMessageProps {
  message: string;
  requirements: string[];
}

const ValidationMessage: FC<ValidationMessageProps> = ({ message, requirements }) => {
  return (
    <div className="rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationMessage;
