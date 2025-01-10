import React, { useState } from 'react';
import "./index.css";

const FileUploadComponent = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  // Handle file change
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  // Function to fetch email events from Brevo
  const getEmailEvents = async () => {
    try {
      const response = await fetch('https://api.brevo.com/v3/events', {
        method: 'GET',
        headers: {
          'api-key': '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', // Correct way to pass API key in Brevo
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching email events: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email Events Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching email events:', error);
    }
  };

  // Handle form submission (file upload)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus('Please select a file to upload.');
      return;
    }

    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('csvFile', file);  // Ensure this matches multer's expected field name
    formData.append('scheduleEmail', scheduleEmail); // Add scheduling option
    formData.append('scheduleTime', scheduleTime); // Add schedule time

    try {
      const response = await fetch('http://localhost:3000/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('File uploaded successfully!');
        
        // After file upload, fetch email events
        const events = await getEmailEvents();
        
        // Optionally, you can process the events data here
        if (events) {
          console.log('Email Events:', events);
          // You can display the events or calculate open/click rates here
        }
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('Failed to upload file.');
    }
  };

  return (
    <>
    <div className="file-upload-container">
      <h1>Upload Your CSV File</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="csvFile"  // Field name should be 'csvFile'
          onChange={handleFileChange}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={scheduleEmail}
              onChange={(e) => setScheduleEmail(e.target.checked)}
            />
            Schedule Emails
          </label>
        </div>
        {scheduleEmail && (
          <div>
            <label>
              Schedule Time (e.g., 5m for 5 minutes, 1h for 1 hour):
              <input
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                placeholder="e.g., 5m, 1h"
              />
            </label>
          </div>
        )}
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
    
    <div class="container">

 
  <h1 class="heading">
    <span class="highlighted-text">Effortlessly Reach Thousands !</span>
  </h1>
</div>

<div class="description">
  <p>
    Power Your Communication with Our Bulk Email Sender Platform!
  </p>
</div>

    </>
  );

  
};

export default FileUploadComponent;