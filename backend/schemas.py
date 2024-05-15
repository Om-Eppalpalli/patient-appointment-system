from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class PatientBase(BaseModel):
    name: str
    mobile_no: str
    email: str
    date_of_birth: Optional[date]
    photo: str
    status: str

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    patient_id: int

    class Config:
        orm_mode = True

# Appointment

class AppointmentBase(BaseModel):
    patient_id: int
    appointment_date: date
    appointment_time: time
    doctor_id: Optional[int] = None
    note: Optional[str] = None
    status: str

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    appointment_id: int

    class Config:
        orm_mode = True


# Doctor

class DoctorBase(BaseModel):
    name: str
    specialty: str
    contact_details: str
    status: str

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(DoctorBase):
    pass

class Doctor(DoctorBase):
    doctor_id: int

    class Config:
        orm_mode = True

# User

class UserBase(BaseModel):
    username: str
    password: str
    email: str
    role: str
    status: str

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
    role: str

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    id: int
    password: str


class ProductItem(BaseModel):
    doctor: str
    price: float
    qnty: int