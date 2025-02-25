CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100),
  working_start_time TIME NOT NULL,
  working_end_time TIME NOT NULL
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT,
  appointment_date DATETIME NOT NULL,
  duration INT NOT NULL,
  appointment_type VARCHAR(100),
  patient_name VARCHAR(100) NOT NULL,
  notes TEXT,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
