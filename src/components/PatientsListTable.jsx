import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const PatientsListTable = ({ patients }) => {

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

    const deletePatient = async (patient_id) => {
        try {
            const response = await fetch(`http://localhost:8000/patients/status/${patient_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({ status: 'Inactive' })
            });
            if (response.ok) {
                toastify('Patient deleted successfully', false);
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                toastify('Failed to delete patient', true);
            }
        } catch (error) {
            toastify('An error occurred while deleting patient', true);
            console.error('Error deleting patient:', error);
        }
    };

    return (
        <>
            {
                patients.map((curPatient) => {
                    const { patient_id, name, mobile_no, email, date_of_birth } = curPatient;

                    return (
                        <tr key={patient_id}>
                            <td>{patient_id}</td>
                            <td>{name}</td>
                            <td>{mobile_no}</td>
                            <td>{email}</td>
                            <td>{date_of_birth}</td>
                            <td><div style={{display: 'flex'}}><div><button className="btn btn-success"><Link to={`/patients/${patient_id}`} key={patient_id} style={{ textDecoration: 'none', color: 'inherit' }}>View</Link></button></div><div style={{marginLeft: '10px'}}><button className="btn btn-danger btn-lg" onClick={() => deletePatient(patient_id)}>Delete</button></div></div></td>
                        </tr>
                    )
                })
            }
            <ToastContainer />
        </>
    )
}

export default PatientsListTable