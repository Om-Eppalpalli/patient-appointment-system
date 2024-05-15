// MyModal.js
import React, { useState, useEffect } from 'react';
import UsersListTable from './UsersListTable';
import './MyModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const MyModal = ({ user, id, closeModal }) => {
    const [selectedRole, setSelectedRole] = useState('');
    const { username, role, email } = user;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setSelectedRole(role);
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, []);

    const toastify = (message, error) => {
        if (error == false) {
            toast.success(message, {
                position: 'top-right',
            });
        } else {
            toast.error(message, {
                position: 'top-right',
            });
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = { username: "", email: "", password: '', status: 'Active', role: selectedRole };

        try {
            const response = await fetch(`http://localhost:8000/user/role_change/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.detail || data.error) {
                toastify(data.detail || data.error, true);
            } else {
                setSelectedRole('');
                toastify("User updated successfully", false);
                closeModal();
            }
        } catch (error) {
            // toastify(error, true);
            console.error('Error creating user:', error);
        }
    }

    return (
        <>
            <div className="modal-wrapper" onClick={closeModal}></div>
            <div className='modal-container'>
                <form onSubmit={handleUpdate}>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', alignItems: 'center', width: '100%' }}>
                        <div className="form-group">
                            <label htmlFor="nameInput">Name:</label>
                            <input type="text" placeholder="Name" value={username} readOnly />
                        </div>
                        <div className="form-group">
                            <label htmlFor="emailInput">Email:</label>
                            <input type="email" placeholder="Email" value={email} readOnly />
                        </div>
                        <div className="form-group">
                            <label htmlFor="roleSelect">Role:</label>
                            <select name="roleSelect" id="roleSelect" style={{ cursor: 'pointer' }} value={selectedRole} onChange={e => setSelectedRole(e.target.value)} required>
                                <option value="" disabled>--Select Role--</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button type="submit" className='btn btn-primary btn-sm' style={{ fontSize: 'small' }}>Update</button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default MyModal;
