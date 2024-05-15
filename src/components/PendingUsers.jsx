import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import UsersListTable from './UsersListTable';
import './UsersList.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import PendingUsersListTable from './PendingUsersListTable';

const PendingUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        fetchPendingUsers();
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

    const fetchPendingUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/users/pending', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if (data.length > 0) {
                setPendingUsers(data);
            } else {
                toastify(data.error, true);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error fetching users:', error);
        }
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginTop: '2%', fontSize: 'xx-large' }}>Pending Users List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sno</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <PendingUsersListTable pendingUsers={pendingUsers} />
                </tbody>
            </table>
        </div>
    );
};

export default PendingUsers;
