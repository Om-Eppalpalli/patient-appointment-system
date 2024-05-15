import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './PatientDetail.css'; // Import CSS file for styling
import Cookies from 'js-cookie';

const PatientDetail = () => {
  const { patient_id } = useParams();
  const [patient, setPatient] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading status
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    fetchPatient();
    fetchPatientAppointments();
  }, [patient_id]);

  const fetchPatient = async () => {
    try {
      // const response = await fetch(`http://localhost:8000/patients/${patient_id}`);
      const response = await fetch(`http://localhost:8000/patients/${patient_id}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data) {
        setPatient(data);
        setLoading(false); // Set loading to false once data is fetched
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const fetchPatientAppointments = async () => {
    try {
      // const response = await fetch(`http://localhost:8000/appointments/${patient_id}`);
      const response = await fetch(`http://localhost:8000/appointments/${patient_id}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data) {
        setAppointments(data);
        getDoctorName(data.doctor_id);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const getDoctorName = async (doctor_id) => {
    try {
      const response = await fetch(`http://localhost:8000/doctor/${doctor_id}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data) {
        setDoctorName(data.name);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  return (
    <div className="patient-detail-container">
      <h2 className="patient-detail-title">Patient Dashboard</h2>
      <div className="patient-detail-content">
        {loading ? (
          <div className="patient-detail-loading">Loading...</div>
        ) : (
          <>
            <div className="patient-detail-card">
              <h3 className="card-title" style={{ background: 'linear-gradient(to right, #0ac282, #0df3a3)' }}>Patient Information</h3>
              <div className="patient-detail-info">
                <div className='patient-detail-wrap'>
                  <div className="patient-detail-field">
                    <span className="patient-detail-label">Name:</span> <span className="patient-detail-value">{patient.name}</span>
                  </div>
                  <div className="patient-detail-field">
                    <span className="patient-detail-label">Mobile No:</span> <span className="patient-detail-value">{patient.mobile_no}</span>
                  </div>
                  <div className="patient-detail-field">
                    <span className="patient-detail-label">Email:</span> <span className="patient-detail-value">{patient.email}</span>
                  </div>
                  <div className="patient-detail-field">
                    <span className="patient-detail-label">Date Of Birth:</span> <span className="patient-detail-value">{patient.date_of_birth}</span>
                  </div>
                  {/* Add more patient details here if needed */}
                </div>
                <div className="patient-detail-photo-container">
                  {patient.photo && (
                    <img className="patient-detail-photo" src={`${patient.photo}`} alt="Patient" />
                  )}
                </div>
              </div>
            </div>
            <div className="patient-detail-card">
              <h3 className="card-title" style={{ background: 'linear-gradient(to right, #0ac282, #0df3a3)' }}>Upcoming Appointment</h3>
              { appointments.appointment_id > 0 ? <div className="appointments-list">
                <div className="appointment-detail-field col-sm-6">
                  <span className="appointment-detail-label">Appointment Date:</span> <span className="appointment-detail-value">{appointments.appointment_date}</span>
                </div>
                <div className="appointment-detail-field col-sm-6">
                  <span className="appointment-detail-label">Appointment Time:</span> <span className="appointment-detail-value">{appointments.appointment_time}</span>
                </div>
                <div className="appointment-detail-field col-sm-6">
                  <span className="appointment-detail-label">Doctor:</span> <span className="appointment-detail-value">{doctorName}</span>
                </div>
                <div className="appointment-detail-field col-sm-6">
                  <span className="appointment-detail-label">Note:</span> <span className="appointment-detail-value">{appointments.note}</span>
                </div>
              </div> : <div style={{marginTop: '5%'}}><p>No upcoming appointments</p></div> }
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
