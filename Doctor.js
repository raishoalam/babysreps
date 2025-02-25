import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorList = ({ setSelectedDoctor }) => {
  const [doctors, setDoctors] = useState([]);  // State to store the list of doctors

  useEffect(() => {
    // Fetch the list of doctors from the backend
    axios.get('http://localhost:3008/doctors')
      .then(response => {
        setDoctors(response.data); // Save the doctor data to state
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
      });
  }, []);

  return (
    <div>
      <h1>Select a Doctor</h1>
      <ul>
        {doctors.length > 0 ? (
          doctors.map(doctor => (
            <li key={doctor.id} onClick={() => setSelectedDoctor(doctor.id)}>
              {doctor.name} ({doctor.specialization})
            </li>
          ))
        ) : (
          <li>No doctors available</li>  // If no doctors, show this message
        )}
      </ul>
    </div>
  );
};

export default DoctorList;
