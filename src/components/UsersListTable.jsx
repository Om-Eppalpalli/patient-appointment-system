import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import fetchUsers from './UsersList';
import Cookies from 'js-cookie';
import Modal from './Modal';

const UsersListTable = ({ users }) => {
    const [editUserId, setEditUserId] = useState(null);
    let sno = 1;

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

    const deleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/users/status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({ status: 'Inactive' })
            });
            if (response.ok) {
                toastify('User deleted successfully', false);
                setTimeout(() => {
                    window.location.reload();
                }, 500)
            } else {
                toastify('Failed to delete user', true);
            }
        } catch (error) {
            toastify('An error occurred while deleting user', true);
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (id) => {
        setEditUserId(id);
    };

    const closeModal = () => {
        setEditUserId(null);
    };

    return (
        <>
            {
                users.map((curUser) => {
                    const { username, email, id, role } = curUser;

                    return (
                        <tr key={id}>
                            <td>{sno++}</td>
                            <td>{id}</td>
                            <td>{username}</td>
                            <td>{email}</td>
                            <td>{role}</td>
                            <td>
                                <button className="btn btn-danger btn-lg" onClick={() => deleteUser(id)}>
                                    Delete
                                </button>
                                <Modal id={id}/>
                            </td>
                        </tr>
                    )
                })
            }
            <ToastContainer />
        </>
    )
}

export default UsersListTable