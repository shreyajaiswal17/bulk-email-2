import React, { useState } from 'react';
import { Upload, Clock, Send, Mail } from 'lucide-react';
import './index.css';  // or './styles/tailwind.css'

const App = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const getEmailEvents = async () => {
    try {
      const response = await fetch('https://api.brevo.com/v3/events', {
        method: 'GET',
        headers: {
          'api-key': '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',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching email events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('scheduleEmail', scheduleEmail);
    formData.append('scheduleTime', scheduleTime);

    try {
      const response = await fetch('http://localhost:3000/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('File uploaded successfully!');
        const events = await getEmailEvents();
        if (events) {
          console.log('Email Events:', events);
        }
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmailContentSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/send-email-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailContent }),
      });

      if (response.ok) {
        alert("Email content submitted successfully!");
      } else {
        alert("Failed to submit email content.");
      }
    } catch (error) {
      alert("An error occurred while submitting the email content.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Bulk Mailer
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-indigo-600 mb-4">
              Effortlessly Reach Thousands!
            </h1>
            <p className="text-xl text-gray-600">
              Power Your Communication with Our Bulk Email Sender Platform
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Email Content Editor</h2>
              <div className="bg-white border rounded-lg p-4">
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="w-full h-64 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write your email content here..."
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <input
                    type="file"
                    name="csvFile"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Select CSV File
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Scheduling Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Schedule Emails</span>
                </label>

                {scheduleEmail && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Schedule Time
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          placeholder="e.g., 5m, 1h"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {status && (
                <div className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {status}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload CSV'}
                </button>

                <button
                  type="button"
                  onClick={handleEmailContentSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Email Content
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;