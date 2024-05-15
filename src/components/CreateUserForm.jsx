import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import UsersListTable from './UsersListTable';
import './CreateUserForm.css'; // Import CSS for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const CreateUserForm = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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

    const handleSubmit = async e => {
        e.preventDefault();
        const formData = { username: name, email: email, password: '', status: 'Pending', role: 'user' };

        try {
            const response = await fetch('http://localhost:8000/users/create', {
                method: 'POST',
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
                setName('');
                setEmail('');
                toastify("User created successfully", false);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error creating user:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            // const response = await fetch('http://localhost:8000/users/');
            const response = await fetch('http://localhost:8000/users/', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if (data.length > 0) {
                setUsers(data);
                // toastify('Users List found', false);
            } else {
                // toastify('Users List not found', true);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error fetching users:', error);
        }
    };

    return (
        <div className="container" style={{ flexDirection: 'column' }}>
            <div className="create-user-form">
                <h2 style={{ textAlign: 'center', marginTop: '2%' }}>Create User</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', alignItems: 'center', width: '100%' }}>
                        <div className="form-group">
                            <label htmlFor="nameInput">Name:</label>
                            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="emailInput">Email:</label>
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button type="submit" className='btn btn-primary btn-sm' style={{ fontSize: 'small' }}>Create User</button>
                        </div>
                    </div>
                </form>

            </div>
            <div className="users-list-form">
                <h2 style={{ textAlign: 'center', marginTop: '5%', marginBottom: '-2%' }}>Users List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sno</th>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <UsersListTable users={users} />
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    );
};

export default CreateUserForm;
