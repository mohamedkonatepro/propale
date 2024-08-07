import React from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
    overflow: 'auto',
  },
};

type BaseModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  children: React.ReactNode;
  customStyleOverrides?: React.CSSProperties;
};

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onRequestClose, title, children, customStyleOverrides }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{ ...customStyles, content: { ...customStyles.content, ...customStyleOverrides } }}
      overlayClassName="fixed inset-0 bg-black bg-opacity-90"
      ariaHideApp={false}
    >
      <div className="flex justify-end items-center pb-2 mb-4">
        <button onClick={onRequestClose}><FaTimes /></button>
      </div>
      <div className="flex justify-center items-center pb-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </Modal>
  );
};

export default BaseModal;
