import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentBooking = ({ doctorId }) => {
  const [availableSlots, setAvailableSlots] = useState([]);  // Store available time slots
  const [appointmentDetails, setAppointmentDetails] = useState({
    patientName: '',
    appointmentType: '',
    notes: ''
  });

  useEffect(() => {
    // Fetch available time slots for the selected doctor
    axios.get(`http://localhost:3008/doctors/${doctorId}/slots?date=${new Date().toISOString().split('T')[0]}`)
      .then(response => {
        setAvailableSlots(response.data); // Save available slots to state
      })
      .catch(error => {
        console.error('Error fetching available slots:', error);
      });
  }, [doctorId]);  // Re-run the effect when doctorId changes

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send the appointment booking request to the backend
    axios.post('http://localhost:3008/appointments', {
      doctorId,
      date: appointmentDetails.date,
      duration: 30,  // Assume a default duration of 30 minutes
      appointmentType: appointmentDetails.appointmentType,
      patientName: appointmentDetails.patientName,
      notes: appointmentDetails.notes
    })
      .then(response => {
        alert('Appointment booked successfully');
      })
      .catch(error => {
        console.error('Error booking appointment:', error);
      });
  };

  return (
    <div>
      <h1>Book an Appointment</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Patient Name:
          <input
            type="text"
            value={appointmentDetails.patientName}
            onChange={(e) => setAppointmentDetails({ ...appointmentDetails, patientName: e.target.value })}
          />
        </label>
        <label>
          Appointment Type:
          <input
            type="text"
            value={appointmentDetails.appointmentType}
            onChange={(e) => setAppointmentDetails({ ...appointmentDetails, appointmentType: e.target.value })}
          />
        </label>
        <label>
          Notes:
          <textarea
            value={appointmentDetails.notes}
            onChange={(e) => setAppointmentDetails({ ...appointmentDetails, notes: e.target.value })}
          />
        </label>
        <label>
          Select Time Slot:
          <select
            value={appointmentDetails.date}
            onChange={(e) => setAppointmentDetails({ ...appointmentDetails, date: e.target.value })}
          >
            {availableSlots.length > 0 ? (
              availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))
            ) : (
              <option>No available slots</option>
            )}
          </select>
        </label>
        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
};

export default AppointmentBooking;
