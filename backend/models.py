from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Time, Text
from sqlalchemy.orm import relationship
from database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    appointment_date = Column(DateTime)
    appointment_time = Column(Time)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"))
    note = Column(String)
    status = Column(String)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    specialty = Column(String)
    contact_details = Column(String)
    status = Column(String)
    
    appointments = relationship("Appointment", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    mobile_no = Column(String)
    email = Column(String)
    date_of_birth = Column(DateTime)
    photo = Column(Text)
    status = Column(String)
    
    appointments = relationship("Appointment", back_populates="patient")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String)
    status = Column(String)
    role = Column(String, default="user")
