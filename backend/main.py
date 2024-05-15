from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import crud
import models
import schemas
from database import SessionLocal, engine
from utils import verify_password
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from jose import JWTError, jwt
from typing import Optional
import secrets
import stripe
from stripe import StripeClient, error, Price
from typing import List, Dict, Any

ACCESS_TOKEN_EXPIRE_MINUTES = 60
ALGORITHM = "HS256"
SECRET_KEY = secrets.token_urlsafe(32)
STRIPE_SECRET_KEY = "sk_test_51PFuzwSJwhiYFd4uTi4GE1jBV0CDhFyv5tjhz7trOS4Ct7bICH4a0WMyq6RR7ZUjs3ySajiiVkUyLuaxis8g6rhy001FMUFJ4W"

# Initialize the Stripe client with your secret key
stripe.api_key = STRIPE_SECRET_KEY

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# OAuth2 password bearer flow
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Custom exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    if exc.status_code == 401:
        return JSONResponse(status_code=exc.status_code, content={"error": "Access Denied, Please login again"})
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

# Dependency to get the current user based on the token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        user = crud.get_user_by_email(db, email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
def get_role(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        user = crud.get_user_by_email(db, email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user.role
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        user = crud.get_admin_by_email(db, email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You're not authorized")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Patients
@app.post("/patients", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to create patient",
            headers={"Error": "True", "Message": "You are not authorized to create patient"},
        )
    if not is_patient_slot_available(db, patient):
        raise HTTPException(
            status_code=400,
            detail="Patient already exists",
            headers={"Error": "True", "Message": "Patient Already Exists"},
        )
    try:
        return crud.create_patient(db=db, patient=patient)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Duplicate entry", headers={"Error": "True", "Message": "Patient already exists"})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error", headers={"Error": "True", "Message": str(e)})

def is_patient_slot_available(db: Session, patient: schemas.PatientCreate):
    existing_patient = crud.is_patient_available(
        db=db,
        email = patient.email,
        status = patient.status
    )
    return existing_patient is None

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_patient = crud.get_patient(db=db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

@app.get("/patients/", response_model=list[schemas.Patient])
def read_patients(current_user: schemas.User = Depends(get_current_user), skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = crud.get_patients(db=db, skip=skip, limit=limit)
    return patients

@app.get("/patients/autocomplete/", response_model=list[schemas.Patient])
def autocomplete_patients(
    search: str = None,  # Add a new query parameter for search
    db: Session = Depends(get_db)
):
    if search:
        patients = crud.autocomplete_patients(db=db, search=search)
        return patients
    else:
        return []

@app.put("/patients/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient: schemas.PatientCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to edit patient",
            headers={"Error": "True", "Message": "You are not authorized to edit patient"},
        )
    try:
        updated_patient = crud.update_patient(db=db, patient_id=patient_id, patient_data=patient)
        if updated_patient is None:
            raise HTTPException(status_code=404, detail="Patient not found")
        return updated_patient
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Duplicate entry", headers={"Error": "True", "Message": "Patient already exists"})

@app.put("/patients/status/{patient_id}", response_model=schemas.Patient)
def update_patient_status(patient_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete patient",
            headers={"Error": "True", "Message": "You are not authorized to delete patient"},
        )
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    db_patient.status = "Inactive"
    db.commit()
    db.refresh(db_patient)
    return db_patient


@app.delete("/patients/{patient_id}", response_model=bool)
def delete_patient(patient_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete patient",
            headers={"Error": "True", "Message": "You are not authorized to delete patient"},
        )
    try:
        success = crud.delete_patient(db=db, patient_id=patient_id)
        if not success:
            raise HTTPException(status_code=404, detail="Patient not found")
        return True
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Integrity Error", headers={"Error": "True", "Message": "Patient deletion failed"})

# Appointments
@app.post("/appointments/create", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to book appointment",
            headers={"Error": "True", "Message": "You are not authorized to book appointment"},
        )
    if not is_appointment_slot_available(db, appointment):
        raise HTTPException(
            status_code=400,
            detail="Appointment slot not available",
            headers={"Error": "True", "Message": "Slot already booked for this doctor at this time"},
        )
    try:
        return crud.create_appointment(db=db, appointment=appointment)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Duplicate entry", headers={"Error": "True", "Message": "Appointment already exists"})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error", headers={"Error": "True", "Message": str(e)})

@app.get("/appointments", response_model=list[schemas.Appointment])
def read_appointments(current_user: schemas.User = Depends(get_current_user), skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    appointments = crud.get_appointments(db=db, skip=skip, limit=limit)
    return appointments

@app.get("/appointments/{patient_id}", response_model=schemas.Appointment)
def read_appointment(patient_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_appointment = crud.get_appointments_by_patient(db=db, patient_id=patient_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

@app.put("/appointments/{appointment_id}", response_model=schemas.AppointmentUpdate)
def update_appointment_status(appointment_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete appointment",
            headers={"Error": "True", "Message": "You are not authorized to delete appointment"},
        )
    db_appointment = crud.get_appointment_status(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

# Function to check if the appointment slot is available
def is_appointment_slot_available(db: Session, appointment: schemas.AppointmentCreate):
    existing_appointment = crud.get_appointment_by_doctor_and_time(
        db=db,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time
    )
    return existing_appointment is None

# Doctors
@app.post("/doctors/create", response_model=schemas.Doctor)
def create_doctor(doctor: schemas.DoctorCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to create doctor",
            headers={"Error": "True", "Message": "You are not authorized to create doctor"},
        )
    if not is_doctor_available(db, doctor):
        raise HTTPException(
            status_code=400,
            detail="Doctor already exists with this Contact details",
            headers={"Error": "True", "Message": "Doctor Already Exists"},
        )
    try:
        return crud.create_doctor(db=db, doctor=doctor)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Duplicate entry", headers={"Error": "True", "Message": "Patient already exists"})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error", headers={"Error": "True", "Message": str(e)})
    
def is_doctor_available(db: Session, doctor: schemas.DoctorCreate):
    existing_doctor = crud.is_doctor_available(
        db=db,
        contact_details = doctor.contact_details,
        status = doctor.status
    )
    return existing_doctor is None

@app.get("/doctors", response_model=list[schemas.Doctor])
def read_doctors(current_user: schemas.User = Depends(get_current_user), skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    doctors = crud.get_doctors(db=db, skip=skip, limit=limit)
    return doctors

@app.get("/doctor/{doctor_id}", response_model=schemas.Doctor)
def read_doctors_id(doctor_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    doctors = crud.get_doctor_by_id(db=db, doctor_id=doctor_id)
    return doctors

@app.put("/doctors/{doctor_id}", response_model=schemas.DoctorUpdate)
def update_doctor_status(doctor_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete doctor",
            headers={"Error": "True", "Message": "You are not authorized to delete doctor"},
        )
    db_doctor = crud.get_doctor_status(db, doctor_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return db_doctor

# Users
@app.post("/users/create", response_model=schemas.User)
def create_user(user: schemas.UserCreate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to create user",
            headers={"Error": "True", "Message": "You are not authorized to create user"},
        )
    if not is_user_available(db, user):
        raise HTTPException(
            status_code=400,
            detail="User already exists with this Email",
            headers={"Error": "True", "Message": "User Already Exists"},
        )
    try:
        return crud.create_user(db=db, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error", headers={"Error": "True", "Message": str(e)})
    
@app.post("/users/google_login", response_model=object)
def create_user_google(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if not is_user_available(db, user):
        raise HTTPException(
            status_code=400,
            detail="User already exists with this Email",
            headers={"Error": "True", "Message": "User Already Exists"},
        )
    if not is_google_user_available(db, user):
        user_create_google = crud.create_user(db=db, user=user)
    try:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error", headers={"Error": "True", "Message": str(e)})
    
def is_user_available(db: Session, user: schemas.UserCreate):
    existing_user = crud.is_user_available(
        db=db,
        email = user.email,
        status = 'Active'
    )
    return existing_user is None

def is_google_user_available(db: Session, user: schemas.UserCreate):
    existing_user = crud.is_google_user_available(
        db=db,
        email = user.email,
        status = 'Hold'
    )
    return existing_user

@app.get("/users", response_model=list[schemas.User])
def read_users(current_user: schemas.User = Depends(get_current_user), skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db=db, skip=skip, limit=limit)
    return users

# @app.get("/user/{id}", response_model=object)
# def read_user(id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
#     users = crud.get_user(db=db, id=id)
#     return users

@app.get("/user/{id}", response_model=object)
def read_user_id(id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = crud.get_user(db=db, id=id)
    return {"username": user.username, "email": user.email, "role": user.role}

@app.put("/users/status/{id}", response_model=schemas.User)
def update_user_status(id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete user",
            headers={"Error": "True", "Message": "You are not authorized to delete user"},
        )
    db_user = crud.get_user(db, id=id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.status = "Inactive"
    db.commit()
    db.refresh(db_user)
    return db_user

@app.put("/user/role_change/{id}", response_model=object)
def update_user_role(id: int, user: schemas.UserCreate, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    curr_user = crud.is_authorized_user(db, current_user.id, current_user.email)
    if not curr_user:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete user",
            headers={"Error": "True", "Message": "You are not authorized to delete user"},
        )
    db_user = crud.update_user_role(db, id=id, role=user.role)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"role": db_user.role}

# @app.put("/users/pending/{id}", response_model=schemas.User)
# def update_pending_user_status(id: int, status: str, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
#     db_user = crud.update_pending_user(db, id=id, status=status)
#     if db_user is None:
#         raise HTTPException(status_code=404, detail="User not found")
#     return db_user

@app.put("/users/pending/{id}", response_model=schemas.User)
def update_patient_pending(id: int, user: schemas.UserUpdate, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
        try:
            updated_user = crud.update_pending_user(db=db, id=id, status=user.status)
            if updated_user is None:
                raise HTTPException(status_code=404, detail="User not found")
            return updated_user
        except error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
@app.get("/users/role", response_model=str)
def read_role(current_user: schemas.User = Depends(get_role), db: Session = Depends(get_db)):
    return current_user
            
@app.get("/users/pending", response_model=list[schemas.User])
def read_pending_users(current_user: schemas.User = Depends(get_current_user), skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_pendig_users(db=db, skip=skip, limit=limit)
    return users

# Login
@app.post("/login/{id}", response_model=schemas.User)
def login_user(request_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    userid = request_data.id
    password = request_data.password

    db_user = crud.get_user_hashed_password(db, id=userid)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = db_user.password
    if not verify_password(password, hashed_password):    
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return db_user

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Route to authenticate and issue JWT token
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_hashed_password(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect User ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# Payment Integration API
@app.post("/api/create-checkout-session")
async def create_checkout_session(products: List[schemas.ProductItem]):
    try:
        line_items = []
        for product in products:
            price = Price.create(
                unit_amount=int(product.price * 100),  # Convert price to cents
                currency="usd",
                product_data={"name": product.doctor}  # Product name
            )
            line_items.append({
                "price": price.id,  # Use price ID
                "quantity": 1
            })

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="http://localhost:3000/appointments/create",
            cancel_url="http://localhost:3000/appointments/create",
        )
        return {"id": session.id}
    except error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# To avoid CORS error using this middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)