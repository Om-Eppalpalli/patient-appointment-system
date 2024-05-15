import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import AppointmentsList from './AppointmentsList';
import './CreateAppointmentForm.css'; // Import CSS for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { loadStripe } from '@stripe/stripe-js';
import ReactSelect from 'react-select';

const PubKey = process.env.REACT_APP_STRIPE;
const stripe = await loadStripe(PubKey);

const CreateAppointmentForm = ({ onSubmit }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true); // State for loading indicator

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      // const response = await fetch('http://localhost:8000/patients/');
      const response = await fetch('http://localhost:8000/patients/', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      setPatients(data);
      setLoading(false); // Set loading to false when data is fetched
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8000/doctors', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data.length > 0) {
        setDoctors(data);
      } else {
        toastify('Doctors List not found', true);
      }
    } catch (error) {
      toastify(error, true);
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({
          appointment_id: 1,
          patient_id: selectedPatient.value || "",
          appointment_date: date,
          appointment_time: `${time}:00`,
          doctor_id: selectedDoctor.value || "",
          note,
          status: 'Active'
        }),
      });
      if (response.ok) {
        // Call the onSubmit function passed as props to handle success
        // onSubmit();
        // Reset form fields
        setSelectedPatient('')
        setDate('');
        setTime('');
        setNote('');
        fetchPatients();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  // payment integration
  const makePayment = async (e) => {
    e.preventDefault();

    const carts = [
      {
        doctor: selectedDoctor.label,
        price: 10,
        qnty: 1
      },
    ];

    const body = {
      products: carts
    }

    const headers = {
      "Content-Type": "application/json"
    }
    const response = await fetch("http://localhost:8000/api/create-checkout-session", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(carts)
    });

    const session = await response.json();

    const result = stripe.redirectToCheckout({
      sessionId: session.id
    });

    if (result.error) {
      console.log(result.error);
    } else {
      handleSubmit();
    }
  }

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toastify = (message, error) => {
    if (error == false) {
      toast.success(message, {
        position: 'top-right',
        position: 'top-right',
      });
    } else {
      toast.error(message, {
        position: 'top-right',
        position: 'top-right',
      });
    }
  }

  return (
    <div className="container" style={{ flexDirection: 'column' }}>
      <div className="create-appointment-form">
        <h2 style={{ textAlign: 'center', marginTop: '2%' }}>Book Appointment</h2>
        {loading ? (
          <p>Loading patients...</p>
        ) : (
          <form onSubmit={makePayment}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <div className="form-group">
                <label htmlFor="patientSelect">Select Patient:</label>
                <ReactSelect
                  id="patientSelect"
                  value={selectedPatient}
                  onChange={selectedOption => setSelectedPatient(selectedOption)}
                  options={patients.map(patient => ({ value: patient.patient_id, label: patient.name }))}
                  placeholder="Select Patient"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateInput">Date:</label>
                <input id="dateInput" type="date" value={date} onChange={e => setDate(e.target.value)} min={getCurrentDate()} required/>
              </div>
              <div className="form-group">
                <label htmlFor="timeInput">Time:</label>
                <input id="timeInput" type="time" value={time} onChange={e => setTime(e.target.value)} required/>
              </div>
              <div className="form-group">
                <label htmlFor="doctorSelect">Select Doctor:</label>
                <ReactSelect
                  id="doctorSelect"
                  value={selectedDoctor}
                  onChange={selectedOption => setSelectedDoctor(selectedOption)}
                  options={doctors.map(doctor => ({ value: doctor.doctor_id, label: doctor.name }))}
                  placeholder="Select Doctor"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="noteInput">Note:</label>
                <input id="noteInput" type="text" placeholder="Note" value={note} onChange={e => setNote(e.target.value)}/>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button type="submit" className='btn btn-primary btn-sm' style={{ fontSize: 'small' }}>Book Appointment</button>
              </div>
            </div>
          </form>
        )}
      </div>
      <div className="appointments-list-create">
        <h2 style={{ textAlign: 'center', marginTop: '5%', marginBottom: '-2%' }}>Appointments List</h2>
        <table>
          <thead>
            <tr>
              <th>Sno</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <AppointmentsList />
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateAppointmentForm;
