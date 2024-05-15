from sqlalchemy.orm import Session, defer
from sqlalchemy import func, or_
from models import Patient, Appointment, Doctor, User
from schemas import PatientCreate, AppointmentCreate, DoctorCreate, UserCreate, AppointmentUpdate
import datetime
from datetime import datetime
from utils import hash_password

# Patients
def create_patient(db: Session, patient: PatientCreate):
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def is_patient_available(
    db: Session,
    email: str,
    status: str,
):
    return db.query(Patient).filter(
        Patient.email == email,
        Patient.status == status,
    ).first()

def get_patient(db: Session, patient_id: int):
    return db.query(Patient).filter(Patient.patient_id == patient_id, Patient.status == "Active").first()

def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Patient).filter(Patient.status == 'Active').offset(skip).limit(limit).all()

def update_patient(db: Session, patient_id: int, patient_data: PatientCreate):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if patient:
        for key, value in patient_data.dict().items():
            setattr(patient, key, value)
        db.commit()
        db.refresh(patient)
        return patient
    return None

def delete_patient(db: Session, patient_id: int):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if patient:
        db.delete(patient)
        db.commit()
        return True
    return False

# Appointments
def create_appointment(db: Session, appointment: AppointmentCreate):
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Appointment).filter(Appointment.status == 'Active').offset(skip).limit(limit).all()

def get_appointments_by_patient(db: Session, patient_id: int):
    current_timestamp = datetime.utcnow()
    return (
        db.query(Appointment)
        .filter(
            Appointment.status == 'Active',
            Appointment.patient_id == patient_id,
            func.concat(
                func.date(Appointment.appointment_date),
                ' ',
                func.time(Appointment.appointment_time)
            ) > current_timestamp
        )
        .order_by(
            func.concat(
                func.date(Appointment.appointment_date),
                ' ',
                func.time(Appointment.appointment_time)
            )
        )
        .first()
    )

def get_appointment_status(db: Session, appointment_id: int):
    db_appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id, Appointment.status == "Active").first()
    if db_appointment:
        db_appointment.status = "Inactive"
        db.commit()
        db.refresh(db_appointment)
        return db_appointment
    else:
        return None

def get_appointment_by_doctor_and_time(
    db: Session,
    doctor_id: int,
    appointment_date: datetime.date,
    appointment_time: datetime.time
):
    return db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appointment_date,
        Appointment.appointment_time == appointment_time,
        Appointment.status == "Active"
    ).first()

# Doctors
def create_doctor(db: Session, doctor: DoctorCreate):
    db_doctor = Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def is_doctor_available(
    db: Session,
    contact_details: str,
    status: str,
):
    return db.query(Doctor).filter(
        Doctor.contact_details == contact_details,
        Doctor.status == status,
    ).first()

def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Doctor).filter(Doctor.status == 'Active').offset(skip).limit(limit).all()

def get_doctor_by_id(db: Session, doctor_id: int):
    return db.query(Doctor).filter(Doctor.doctor_id == doctor_id, Doctor.status == "Active").first()

def get_doctor_status(db: Session, doctor_id: int):
    db_doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id, Doctor.status == "Active").first()
    if db_doctor:
        db_doctor.status = "Inactive"
        db.commit()
        db.refresh(db_doctor)
        return db_doctor
    else:
        return None

# Users
def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.username)
    db_user = User(username=user.username, email=user.email, password=hashed_password, status=user.status, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def is_user_available(
    db: Session,
    email: str,
    status: str,
):
    return db.query(User).filter(
        User.email == email,
        User.status == status,
    ).first()

def is_google_user_available(
    db: Session,
    email: str,
    status: str,
):
    return db.query(User).filter(
        User.email == email,
        User.status == status,
    ).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.status == 'Active').options(
        # Exclude the password column from the query
        defer(User.password)  # Exclude the password column
    ).offset(skip).limit(limit).all()

def get_user(db: Session, id: int):
    return db.query(User).filter(User.id == id, User.status == "Active").options(defer(User.password)).first()

def get_pendig_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.status == 'Pending').offset(skip).limit(limit).all()
    
def update_pending_user(db: Session, id: int, status: str):
    db_user = db.query(User).filter(User.id == id, User.status == "Pending").first()
    if db_user:
        db_user.status = status
        db.commit()
        db.refresh(db_user)
        return db_user
    else:
        return None
    
def update_user_role(db: Session, id: int, role: str):
    db_user = db.query(User).filter(User.id == id, User.status == "Active").first()
    if db_user:
        db_user.role = role
        db.commit()
        db.refresh(db_user)
        return db_user
    else:
        return None

def get_user_hashed_password(db: Session, id: int):
    return db.query(User).filter(User.id == id, User.status == "Active").first()

def is_authorized_user(db: Session, id: int, email: str):
    return db.query(User).filter(User.id == id, User.email == email, User.status == "Active").first()

# Function to get user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email, or_(User.status == "Active", User.status == "Hold")).first()

def get_admin_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email, or_(User.status == "Active", User.status == "Hold"), User.role == "admin").first()