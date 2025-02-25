import React, { useState } from 'react';
import Doctor from './Doctor';  
import AppointmentBooking from './AppointmentBooking'; 

const App = () => {

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <div className="App">
      <h1>Appointment Booking System</h1>
      
      
      {!selectedDoctor ? (
        <Doctor setSelectedDoctor={setSelectedDoctor} />
      ) : (
        
        <AppointmentBooking doctorId={selectedDoctor} />
      )}
    </div>
  );
}

export default App;
