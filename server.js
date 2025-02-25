const express = require('express');
const mysql = require('mysql2');
const moment = require('moment');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setup MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL user
  password: 'root',  // replace with your MySQL password
  database: 'babysteps_appointments'
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

// Get all doctors
app.get('/doctors', async (req, res) => {
  db.query('SELECT * FROM doctors', (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving doctors' });
    } else {
      res.json(result);
    }
  });
});

// Get available slots for a doctor on a specific date
app.get('/doctors/:id/slots', async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  // Fetch doctor's working hours
  db.query('SELECT * FROM doctors WHERE id = ?', [id], (err, doctorResult) => {
    if (err || doctorResult.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const doctor = doctorResult[0];

    const workingStart = moment(`${date} ${doctor.workingHoursStart}`);
    const workingEnd = moment(`${date} ${doctor.workingHoursEnd}`);

    // Fetch existing appointments for the doctor
    db.query('SELECT * FROM appointments WHERE doctorId = ? AND DATE(appointmentDate) = ?', [id, date], (err, appointments) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving appointments' });
      }

      let availableSlots = [];
      let slotStart = workingStart;

      // Check for available 30-minute slots
      while (slotStart.isBefore(workingEnd)) {
        const slotEnd = slotStart.clone().add(30, 'minutes');
        const conflictingAppointment = appointments.find((app) => 
          moment(app.appointmentDate).isBetween(slotStart, slotEnd, null, '[)')
        );

        if (!conflictingAppointment) {
          availableSlots.push({
            start: slotStart.format(),
            end: slotEnd.format(),
          });
        }

        slotStart = slotEnd;
      }

      res.json(availableSlots);
    });
  });
});

// Create a new appointment
app.post('/appointments', async (req, res) => {
  const { doctorId, appointmentDate, duration, appointmentType, patientName, notes } = req.body;

  // Check for conflicting appointments
  db.query('SELECT * FROM appointments WHERE doctorId = ? AND appointmentDate = ?', [doctorId, appointmentDate], (err, conflictingAppointments) => {
    if (conflictingAppointments.length > 0) {
      return res.status(400).json({ message: 'Time slot is already booked.' });
    }

    // Insert new appointment into DB
    db.query('INSERT INTO appointments (doctorId, appointmentDate, duration, appointmentType, patientName, notes) VALUES (?, ?, ?, ?, ?, ?)', 
      [doctorId, appointmentDate, duration, appointmentType, patientName, notes], 
      (err) => {
        if (err) {
          res.status(500).json({ message: 'Error creating appointment' });
        } else {
          res.status(201).json({ message: 'Appointment booked successfully.' });
        }
      }
    );
  });
});

// Update an appointment
app.put('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { appointmentDate, duration } = req.body;

  // Check if new time slot conflicts with existing appointments
  db.query('SELECT * FROM appointments WHERE doctorId = ? AND appointmentDate = ? AND id != ?', 
    [req.body.doctorId, appointmentDate, id], (err, conflictingAppointments) => {
      if (conflictingAppointments.length > 0) {
        return res.status(400).json({ message: 'Time slot is already booked.' });
      }

      // Update the appointment
      db.query('UPDATE appointments SET appointmentDate = ?, duration = ? WHERE id = ?', 
        [appointmentDate, duration, id], (err) => {
          if (err) {
            res.status(500).json({ message: 'Error updating appointment' });
          } else {
            res.json({ message: 'Appointment updated successfully.' });
          }
        }
      );
    });
});

// Cancel an appointment
app.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM appointments WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ message: 'Error canceling appointment' });
    } else {
      res.json({ message: 'Appointment canceled successfully.' });
    }
  });
});

// Start server
const PORT = 3008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
