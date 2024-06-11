import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    if (!modalRoot) {
      throw new Error('Modal root element not found');
    }

    return () => {
    };
  }, [modalRoot]);

  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg relative">
        <Button variant="default" size="extra-sm" onClick={onClose} className="absolute top-2 right-2 ">
          <span className="sr-only">Close</span>
          X
        </Button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
