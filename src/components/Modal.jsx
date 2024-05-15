// Modal.js
import React, { useState, useEffect } from "react";
import MyModal from "./MyModal";
import Cookies from 'js-cookie';

const Modal = ({ id }) => {
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState([]);

    useEffect(() => {
        if (showModal) {
            fetchUser();
        }
    }, [showModal]); // Fetch user data when modal is opened

    const closeModal = () => {
        return setShowModal(false);
    }

    const fetchUser = async () => {
        try {
            const response = await fetch(`http://localhost:8000/user/${id}`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if (data.detail || data.error) {
                // toastify(data.detail || data.error, true);
            } else {
                setUser(data);
                // toastify('Users List found', false);
            }
        } catch (error) {
            // toastify(error, true);
            console.error('Error fetching users:', error);
        }
    };

    return (
        <>
            <button className="btn btn-warning btn-lg" style={{ marginLeft: "10px" }} onClick={() => setShowModal(true)}>Edit</button>
            {showModal && <MyModal user={user} id={id} closeModal={closeModal} />}
        </>
    );
};

export default Modal;
