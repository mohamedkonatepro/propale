import React from 'react';
import Image from 'next/image';

interface ActionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  cancelButtonText?: string;
  confirmButtonText: string;
  icon?: string; // Permet de passer une icône personnalisée
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelButtonText,
  confirmButtonText,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          {icon && (
            <Image
              src={icon}
              alt="Icon"
              width={40}
              height={40}
              className="w-7 h-7"
            />
          )}
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500 mb-10 text-sm">{message}</p>
        <div className={`flex ${onClose ? "justify-between" : "justify-center"} gap-4`}>
          {onClose && <button
            className="bg-white hover:bg-gray-100 text-blueCustom py-2 px-4 rounded"
            onClick={onClose}
          >
            {cancelButtonText}
          </button>}
          <button
            className="bg-blueCustom hover:bg-blue-700 text-white py-3 px-4 rounded-xl"
            onClick={onConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
