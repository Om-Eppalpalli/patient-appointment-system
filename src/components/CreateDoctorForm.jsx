import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import DoctorsListTable from './DoctorsListTable';
import './CreateDoctorForm.css'; // Import CSS for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const CreateDoctorForm = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [speciality, setSpeciality] = useState('');
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetchDoctors();
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
        const formData = { name: name, contact_details: mobileNo, specialty: speciality, status: 'Active' };

        try {
            const response = await fetch('http://localhost:8000/doctors/create', {
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
                setMobileNo('');
                setSpeciality('');
                toastify("Doctor created successfully", false);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error creating doctor:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            // const response = await fetch('http://localhost:8000/doctors/');
            const response = await fetch('http://localhost:8000/doctors/', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if (data.length > 0) {
                setDoctors(data);
                // toastify('Doctors List found', false);
            } else if (data.detail || data.error) {
                toastify(data.detail || data.error, true);
            } else {
                // toastify('Doctors List not found', true);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error fetching doctors:', error);
        }
    };

    return (
        <div className="container" style={{ flexDirection: 'column' }}>
            <div className="create-doctor-form">
                <h2 style={{ textAlign: 'center', marginTop: '2%' }}>Create Doctor</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <div className="form-group">
                            <label htmlFor="nameInput">Name:</label>
                            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mobileInput">Mobile:</label>
                            <input type="text" placeholder="Mobile No" value={mobileNo} onChange={e => setMobileNo(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="specialityInput">Speciality:</label>
                            <input type="text" placeholder="Speciality" value={speciality} onChange={e => setSpeciality(e.target.value)} required />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button type="submit" className='btn btn-primary btn-sm' style={{ fontSize: 'small' }}>Create Doctor</button>
                        </div>
                    </div>
                </form>

            </div>
            <div className="doctors-list-form">
                <h2 style={{ textAlign: 'center', marginTop: '5%', marginBottom: '-2%' }}>Doctors List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sno</th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Speciality</th>
                            <th>Contact</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <DoctorsListTable doctors={doctors} />
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    );
};

export default CreateDoctorForm;
