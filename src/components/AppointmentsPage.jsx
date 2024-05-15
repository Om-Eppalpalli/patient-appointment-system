import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateAppointmentForm from './CreateAppointmentForm';

const AppointmentsPage = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/patients/');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreateAppointment = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Appointment created successfully!");
      } else {
        console.error('Error creating appointment:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <div>
      <h2>Appointments</h2>
      <Link to="/appointments/create">Create Appointment</Link>

      {/* Render the CreateAppointmentForm component */}
      <CreateAppointmentForm patients={patients} onSubmit={handleCreateAppointment} />
    </div>
  );
};

export default AppointmentsPage;
