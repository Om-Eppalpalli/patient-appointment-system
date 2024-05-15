import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const PendingUsersListTable = ({ pendingUsers }) => {
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

    const appdeletePendingUser = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8000/users/pending/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({ status: status, username: '', password: '', email: '', role: '' })
            });
            if (response.ok) {
                toastify('User deleted successfully', false);
                setTimeout(() => {
                    window.location.reload();
                }, 500)
            } else if(response.status === 404) {
                toastify("You're not Authorized", true);
            } else {
                toastify('Failed to delete user', true);
            }
        } catch (error) {
            toastify('An error occurred while deleting user', true);
            console.error('Error deleting user:', error);
        }
    };

    return (
        <>
            {
                pendingUsers.map((curUser) => {
                    const { username, email, id } = curUser;

                    return (
                        <tr key={id}>
                            <td>{sno++}</td>
                            <td>{username}</td>
                            <td>{email}</td>
                            <td><div style={{display: 'flex'}}><div><button className="btn btn-danger btn-lg" onClick={() => appdeletePendingUser(id, 'Inactive')}>Reject</button></div><div style={{marginLeft: '10px'}}><button className="btn btn-success btn-lg" onClick={() => appdeletePendingUser(id, 'Active')}>Approve</button></div></div></td>
                        </tr>
                    )
                })
            }
            <ToastContainer />
        </>
    )
}

export default PendingUsersListTable