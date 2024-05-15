// EditUserModal.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const EditUserModal = ({ userId, onClose }) => {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  // Logic to fetch user data based on userId and prefill the form fields
  
  return ReactDOM.createPortal(
    <>
      <div className="modal-wrapper" onClick={onClose}></div>
      <div className="modal-container">
        {/* Form for editing user data */}
        <h2>Edit User</h2>
        {/* Form fields */}
        {/* Update button */}
        <button className="modal-btn" onClick={onClose}>Cancel</button>
      </div>
    </>,
    document.getElementById("modal-root") // Render inside modal-root div
  );
};

export default EditUserModal;
