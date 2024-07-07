import { FC } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessTextProps {
  message: string;
}

const SuccessText: FC<SuccessTextProps> = ({ message }) => {
  return (
    <div className="rounded-md p-4 flex">
      <div className="flex-shrink-0">
        <FaCheckCircle className="h-5 w-5 text-green-400" />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-green-400">{message}</h3>
      </div>
    </div>
  );
};

export default SuccessText;
