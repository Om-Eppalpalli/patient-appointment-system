import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTable } from 'react-table';
import PatientsListTable from './PatientsListTable';
import './PatientsList.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('http://localhost:8000/patients/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.length > 0) {
        setPatients(data);
        // toastify('Patients List found', false);
      } else {
        toastify(data.error, true);
      }
    } catch (error) {
      toastify(error, true);
      console.error('Error fetching patients:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    return (
      patient &&
      (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) /*||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.date_of_birth?.toLowerCase().includes(searchTerm.toLowerCase())*/)
    );
  });

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: '2%', fontSize: 'xx-large' }}>Patients List</h2>
      <div className='searchBoxAddDiv'>
        <input 
          type="text" 
          placeholder="Search by Patient Name & Mobile"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '15%' }} 
        />
        <Link to="/patients/create" className='btn btn-primary btn-lg' style={{ float: 'right', marginRight: '18%' }}>Add Patient</Link>
      </div>
      <br />
      <table>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Date Of Birth</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <PatientsListTable patients={filteredPatients} />
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default PatientsList;
