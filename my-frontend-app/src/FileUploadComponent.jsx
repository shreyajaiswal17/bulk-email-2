import React, { useState } from 'react';

const FileUploadComponent = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  // Handle file change
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
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
    console.log(file);
    try {
      const response = await fetch('http://localhost:3000/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('File uploaded successfully!');
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('Failed to upload file.');
    }
  };

  return (
    <div className="file-upload-container">
      <h1>Upload CSV File</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="csvFile"  // Field name should be 'csvFile'
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default FileUploadComponent;
