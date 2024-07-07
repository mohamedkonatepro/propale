import { FC } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessAlertProps {
  message: string;
  title: string;
}

const SuccessAlert: FC<SuccessAlertProps> = ({ title, message }) => {
  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaCheckCircle className="h-5 w-5 text-green-700" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAlert;
