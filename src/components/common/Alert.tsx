import { FC } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

interface AlertProps {
  message: string;
}

const CustomAlert: FC<AlertProps> = ({ message }) => {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          <FaExclamationCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
