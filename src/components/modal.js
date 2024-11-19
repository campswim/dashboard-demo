import React, { useState, useEffect } from 'react';

const Modal = ({ children, isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset the modal visibility each time children change
      setShowModal(false);

      // If children are provided, start the timer to show the modal.
      const timer = setTimeout(() => setShowModal(true), 750);
      
      // Cleanup function to clear the timer if the component unmounts or children change.
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [isOpen]); // Dependency array ensures effect runs when children change.

  return (
    <div className={`modal-overlay ${showModal ? 'show' : ''}`}>
      <div className='modal-content'>
        <span className='x-close' onClick={onClose}>x</span>
        {children}
      </div>
    </div>
  );
};

export default Modal;
