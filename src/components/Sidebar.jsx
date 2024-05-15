import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import AppointmentsList from './AppointmentsList';
import CreatePatientForm from './CreatePatientForm';
import CreateAppointmentForm from './CreateAppointmentForm';
import PatientDetail from './PatientDetail';
import PatientsList from './PatientsList';
import AppointmentsLists from './AppointmentsLists';
import CreateDoctorForm from './CreateDoctorForm';
import DoctorsLists from './DoctorsLists';
import UsersList from './UsersList';
import CreateUserForm from './CreateUserForm';
import SearchBar from './SearchBar';
import Cookies from 'js-cookie';

const Sidebar = ({ isOpen, onClose, onLogout, role }) => {
    return (
        <Drawer anchor="left" open={isOpen} onClose={onClose}>
            <List>
                <ListItem button component={Link} to="/patients" onClick={onClose}>
                    <ListItemText primary="Patients List" />
                </ListItem>
                <ListItem button component={Link} to="/patients/create" onClick={onClose}>
                    <ListItemText primary="Add Patient" />
                </ListItem>
                <ListItem button component={Link} to="/appointments" onClick={onClose}>
                    <ListItemText primary="Appointments List" />
                </ListItem>
                <ListItem button component={Link} to="/appointments/create" onClick={onClose}>
                    <ListItemText primary="Book Appointment" />
                </ListItem>
                <ListItem button component={Link} to="/doctors" onClick={onClose}>
                    <ListItemText primary="Doctors List" />
                </ListItem>
                <ListItem button component={Link} to="/doctors/create" onClick={onClose}>
                    <ListItemText primary="Add Doctor" />
                </ListItem>
                <ListItem button component={Link} to="/users" onClick={onClose}>
                    <ListItemText primary="Users List" />
                </ListItem>
                <ListItem button component={Link} to="/users/create" onClick={onClose}>
                    <ListItemText primary="Add User" />
                </ListItem>
                {role === 'admin' && <ListItem button component={Link} to="/users/pending" onClick={onClose}>
                    <ListItemText primary="Pending User" />
                </ListItem>}
                <ListItem button onClick={onLogout}> {/* Add logout button */}
                    <ExitToAppIcon />
                    <ListItemText primary="Logout" />
                </ListItem>
                {/* Add more list items for other pages */}
            </List>
        </Drawer>
    );
};

export default Sidebar;
