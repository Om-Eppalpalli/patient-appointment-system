import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import UsersListTable from './UsersListTable';
import './UsersList.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const UsersList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
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

    const fetchUsers = async () => {
        try {
            //   const response = await fetch('http://localhost:8000/users');
            const response = await fetch('http://localhost:8000/users', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if (data.detail || data.error) {
                toastify(data.detail || data.error, true);
            } else {
                setUsers(data);
                // toastify('Users List found', false);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error fetching users:', error);
        }
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginTop: '2%', fontSize: 'xx-large' }}>Users List</h2>
            <Link to="/users/create" className='btn btn-primary btn-lg' style={{ float: 'right', marginRight: '18%' }}>Add User</Link>
            <br />
            <table>
                <thead>
                    <tr>
                        <th>Sno</th>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <UsersListTable users={users} />
                </tbody>
            </table>
        </div>
    );
};

export default UsersList;
