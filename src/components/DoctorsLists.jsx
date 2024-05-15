import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import DoctorsListTable from './DoctorsListTable';
import './DoctorsList.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Cookies from 'js-cookie';

const DoctorsList = () => {
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

    const fetchDoctors = async () => {
        try {
            //   const response = await fetch('http://localhost:8000/doctors');
            const response = await fetch('http://localhost:8000/doctors', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if (data.length > 0) {
                setDoctors(data);
                // toastify('Doctors List found', false);
            } else {
                // toastify('Doctors List not found', true);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error fetching doctors:', error);
        }
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginTop: '2%', fontSize: 'xx-large' }}>Doctors List</h2>
            <Link to="/doctors/create" className='btn btn-primary btn-lg' style={{ float: 'right', marginRight: '18%' }}>Add Doctor</Link>
            <br />
            <table>
                <thead>
                    <tr>
                        <th>Sno</th>
                        <th>Doctor ID</th>
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
    );
};

export default DoctorsList;
