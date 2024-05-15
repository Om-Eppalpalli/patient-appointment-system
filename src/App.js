import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './components/Sidebar';
import AppointmentsList from './components/AppointmentsList';
import CreatePatientForm from './components/CreatePatientForm';
import CreateAppointmentForm from './components/CreateAppointmentForm';
import PatientDetail from './components/PatientDetail';
import PatientsList from './components/PatientsList';
import AppointmentsLists from './components/AppointmentsLists';
import CreateDoctorForm from './components/CreateDoctorForm';
import DoctorsLists from './components/DoctorsLists';
import UsersList from './components/UsersList';
import CreateUserForm from './components/CreateUserForm';
import LoginPage from './components/LoginPage';
import PendingUsers from './components/PendingUsers';
import SearchBar from './components/SearchBar';
import Navbar from './components/Navbar';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('token'));
  const [role, setRole] = React.useState([]);

  useEffect(() => {
    getUserRole();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const getUserRole = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/role', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data) {
        setRole(data);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  return (
    <Router>
      <div>
        {isLoggedIn && <Navbar handleLogout={handleLogout} />}
        {isLoggedIn && <IconButton onClick={toggleSidebar} style={{ position: 'absolute', top: 0, left: 0 }}>
          <MenuIcon />
        </IconButton>}
        {isLoggedIn && <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onLogout={handleLogout} role={role} />}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/create" element={<CreatePatientForm />} />
          <Route path="/patients/:patient_id" element={<PatientDetail />} />
          <Route path="/appointments/create" element={<CreateAppointmentForm />} />
          <Route path="/appointments" element={<AppointmentsLists />} />
          <Route path="/doctors" element={<DoctorsLists />} />
          <Route path="/doctors/create" element={<CreateDoctorForm />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/create" element={<CreateUserForm />} />
          {role === 'admin' && <Route path="/users/pending" element={<PendingUsers />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;




// <Router>
//   <div>
//   {isLoggedIn && <Navbar handleLogout={handleLogout}/>}
//     <IconButton onClick={toggleSidebar} style={{ position: 'absolute', top: 0, left: 0 }}>
//       <MenuIcon />
//     </IconButton>
//     <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onLogout={handleLogout} />
//     <Routes>
{/* <Route path="/" element={<PublicRoute element={<LoginPage />} />} />
          <Route path="/patients" element={<PrivateRoute element={<PatientsList />} />} />
          <Route path="/patients/create" element={<PrivateRoute element={<CreatePatientForm />} />} />
          <Route path="/patients/:patient_id" element={<PrivateRoute element={<PatientDetail />} />} />
          <Route path="/appointments/create" element={<PrivateRoute element={<CreateAppointmentForm />} />} />
          <Route path="/appointments" element={<PrivateRoute element={<AppointmentsLists />} />} />
          <Route path="/doctors" element={<PrivateRoute element={<DoctorsLists />} />} />
          <Route path="/doctors/create" element={<PrivateRoute element={<CreateDoctorForm />} />} />
          <Route path="/users" element={<PrivateRoute element={<UsersList />} />} />
          <Route path="/users/create" element={<PrivateRoute element={<CreateUserForm />} />} /> */}
//     </Routes>
//   </div>
// </Router>