import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import AppointmentsList from './AppointmentsList';
import './CreateAppointmentForm.css'; // Import CSS for styling

const AppointmentsLists = () => {

    return (
        <div className="container" style={{ flexDirection: 'column' }}>
            <div className="appointments-lists">
                <h2 style={{ textAlign: 'center', marginTop: '2%', fontSize: 'xx-large' }}>Appointments List</h2>
                <Link to="/appointments/create" className='btn btn-primary btn-lg' style={{ float: 'right', marginRight: '18%' }}>Book Appointments</Link>
                <br />
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
        </div>
    );
}

export default AppointmentsLists;