import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const DoctorsListTable = ({ doctors }) => {
    let sno = 1;

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

    const deleteDoctor = async (doctor_id) => {
        try {
            const response = await fetch(`http://localhost:8000/doctors/${doctor_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({ status: 'Inactive' })
            });
            if (response.ok) {
                toastify('Doctor deleted successfully', false);
            } else {
                toastify('Failed to delete doctor', true);
            }
        } catch (error) {
            toastify('An error occurred while deleting doctor', true);
            console.error('Error deleting doctor:', error);
        }
    };

    return (
        <>
            {
                doctors.map((curPatient) => {
                    const { name, specialty, contact_details, doctor_id } = curPatient;

                    return (
                        <tr key={doctor_id}>
                            <td>{sno++}</td>
                            <td>{doctor_id}</td>
                            <td>{name}</td>
                            <td>{specialty}</td>
                            <td>{contact_details}</td>
                            <td><button className="btn btn-danger btn-lg" onClick={() => deleteDoctor(doctor_id)}>Delete</button></td>
                        </tr>
                    )
                })
            }
            <ToastContainer />
        </>
    )
}

export default DoctorsListTable