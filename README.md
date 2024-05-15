# Patient Appointment System

This is a React + FastAPI project.

## Project Structure
patient-appointment-system/
├── backend/
│ main.py
│ ├── venv/
│ └── ...
├
│ public/
│ src/
│ node_modules/
│ package.json
│ .env
│ ...
| .gitignore
| README.md

## Setup

### Backend (FastAPI)
1. **Navigate to the `backend` directory**:
   ```sh
   cd backend
2. Create and activate a virtual environment:
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
3. Run the FastAPI server:
    uvicorn app.main:app --reload
4. Open Xampp and start Apache & MySQL for Database

### Frontend (React)
1. Navigate to the frontend directory:
    cd frontend
2. Install dependencies:
    npm install
3. Run the React development server:
    npm start

### Running the Full Application
Ensure the FastAPI backend server is running.
Start the React frontend server.
Open your web browser and go to http://localhost:3000 to see the frontend application. The frontend will make API requests to the backend server running at http://localhost:8000.

### Project Commands
### Backend
Run the server: uvicorn app.main:app --reload
Run tests: pytest

### Frontend
Start development server: npm start
Build for production: npm run build
Run tests: npm test
