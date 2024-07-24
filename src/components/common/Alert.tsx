import { FC } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

interface AlertProps {
  message: string;
  title?: string;
}

const CustomAlert: FC<AlertProps> = ({ message, title }) => {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex items-center justify-start">
        <div className="flex-shrink-0">
          <FaExclamationCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          { title && <div className="mt-2 text-sm text-red-700 font-bold">
            <p>{title}</p>
          </div>}
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
