import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const AppointmentsList = ({ appointments }) => {
  const [appointment, setAppointment] = useState([]);
  let sno = 1;

  useEffect(() => {
    fetchAppointments();
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

  const fetchAppointments = async () => {
    try {
      // const response = await fetch('http://localhost:8000/appointments/');
      const response = await fetch('http://localhost:8000/appointments/', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data.length > 0) {
        setAppointment(data);
        // toastify('Appointments List found', false);
      } else if (data.detail || data.error) {
        toastify(data.detail || data.error, true);
      } else {
        toastify('Appointments List not found', true);
      }
    } catch (error) {
      toastify(error, true);
      console.error('Error fetching Appointments:', error);
    }
  };

  const deleteAppointment = async (appointment_id) => {
    try {
      const response = await fetch(`http://localhost:8000/appointments/${appointment_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({ status: 'Inactive' })
      });
      if (response.ok) {
        toastify('Appointment deleted successfully', false);
      } else {
        toastify('Failed to delete appointment', true);
      }
    } catch (error) {
      toastify('An error occurred while deleting appointment', true);
      console.error('Error deleting appointment status:', error);
    }
  };

  return (
    <>
      {
        appointment.map((currAppointment) => {
          const { patient_id, appointment_date, appointment_time, doctor_id, note, appointment_id } = currAppointment;
          return (
            <tr key={appointment_id}>
              <td>{sno++}</td>
              <td>{patient_id}</td>
              <td>{doctor_id}</td>
              <td>{appointment_date}</td>
              <td>{appointment_time}</td>
              <td>{note}</td>
              <td><button className="btn btn-danger btn-lg" onClick={() => deleteAppointment(appointment_id)}>Delete</button></td>
            </tr>
          )
        })
      }
      <ToastContainer />
    </>
  )
};

export default AppointmentsList;
