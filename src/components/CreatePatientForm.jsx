import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import PatientsListTable from './PatientsListTable';
import './CreateAppointmentForm.css'; // Import CSS for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const CreatePatientForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [photo, setPhoto] = useState('');
  const [patients, setPatients] = useState([]);

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

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = { name: name, mobile_no: mobileNo, email: email, date_of_birth: dateOfBirth, status: 'Active', photo: photo };

    try {
      const response = await fetch('http://localhost:8000/patients', {
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
        setEmail('');
        setDateOfBirth('');
        setPhoto('');
        toastify("Patient created successfully", false);
      }
    } catch (error) {
      toastify(error, true);
      console.error('Error creating patient:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result;
      setPhoto(base64String);
    };

    // Read the image file as Data URL
    reader.readAsDataURL(file);
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/patients/', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data.length > 0) {
        setPatients(data);
        // toastify('Patients List found', false);
      } else {
        toastify('Patients List not found', true);
      }
    } catch (error) {
      toastify(error, true);
      console.error('Error fetching patients:', error);
    }
  };

  return (
    <div className="container" style={{ flexDirection: 'column' }}>
      <div className="create-appointment-form">
        <h2 style={{ textAlign: 'center', marginTop: '2%' }}>Create Patient</h2>

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
              <label htmlFor="emailInput">Email:</label>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="dobInput">Date Of Birth:</label>
              <input type="date" placeholder="Date of Birth" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="photoInput">Passport Size Photo:</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="submit" className='btn btn-primary btn-sm' style={{ fontSize: 'small' }}>Create Patient</button>
            </div>
          </div>
        </form>

      </div>
      <div className="appointments-list-form">
        <h2 style={{ textAlign: 'center', marginTop: '5%', marginBottom: '-2%' }}>Patients List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Date Of Birth</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <PatientsListTable patients={patients} />
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreatePatientForm;
