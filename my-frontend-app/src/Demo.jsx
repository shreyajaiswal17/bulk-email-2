import React, { useState, useEffect } from "react";
import { Upload, Clock, Send, Users, FileText, Mail, X } from "lucide-react";
import "simplemde/dist/simplemde.min.css";
import "./index.css"; // Adjust with your CSS file path
import Homepage from "./Homepage";
import EmailAnalyticsDashboard from "./EmailAnalytics";
import axios from "axios";
import AuthForm from './Login';


const Demo = () => {
  const [recipients, setRecipients] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showOptOutPreview, setShowOptOutPreview] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
 
 

  const getCompleteEmailContent = () => emailContent;



  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const parseManualInput = (input) => {
    const entries = input.split(',').map(entry => entry.trim());
    const parsed = entries.map(entry => {
      const parts = entry.split(/[<>]/).map(part => part.trim());
      return parts.length === 1 
        ? { email: parts[0], name: '' }
        : { name: parts[0], email: parts[1] || parts[0] };
    });
    
    const validEntries = parsed.filter(({ email }) => validateEmail(email));
    setError(validEntries.length !== parsed.length 
      ? 'Some email addresses were invalid and have been removed' 
      : '');
    
    return validEntries;
  };

  const handleManualInputChange = (e) => {
    const value = e.target.value.trim();
    setManualInput(value);
    setRecipients(parseManualInput(value));
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setManualInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("scheduleEmail", scheduleEmail);
    formData.append("scheduleTime", scheduleTime);
    formData.append("emailContent", getCompleteEmailContent());
    const token = localStorage.getItem("token");  // Retrieve token from localStorage
    console.log("token", token);
    try {
      const response = await fetch("import .meta.env.BACKEND_URL/upload-csv", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,  // Include token in the request headers
        },
        body: formData,
      });

      const result = await response.json();
      setStatus(response.ok ? "File uploaded successfully!" : `Error: ${result.message}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendEmails = async () => {
    if (recipients.length === 0) {
      setError('No recipients to send emails.');
      return;
    }

    setError('');
    const token = localStorage.getItem("token");  // Retrieve token from localStorage
    console.log("token", token);
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL/send-manual-emails, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Include token in the request headers
        },
        body: JSON.stringify({
          emailList: recipients,
          scheduleEmail,
          scheduleTime,
          emailContent: getCompleteEmailContent(),
        }),
      });

      if (response.ok) {
        alert("Emails sent successfully!");
      } else {
        alert(response.data.message); // If error message is returned from backend
      }
    } catch (error) {
      console.error(error);
      setError('Failed to send emails. Please try again', error);
    }
  };

  return (
   
      <div className="min-h-screen bg-gray-50">
      

        <main className="py-8">
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <h1 className="text-xl font-semibold">Email Campaign</h1>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Recipients Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recipients</h3>

                  {/* Custom Tabs */}
                  <div className="border-b border-gray-200">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveTab('manual')}
                        className={`px-4 py-2 flex items-center space-x-2 border-b-2 ${
                          activeTab === 'manual'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Manual Input</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('csv')}
                        className={`px-4 py-2 flex items-center space-x-2 border-b-2 ${
                          activeTab === 'csv'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>CSV Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {activeTab === 'manual' && (
                      <div className="space-y-4">
                        <textarea
                          value={manualInput}
                          onChange={handleManualInputChange}
                          placeholder="Enter emails separated by commas or in format: Name <email@example.com>"
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {recipients.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {recipients.length} valid recipient(s)
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'csv' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <input
                            type="file"
                                name="csvFile"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept=".csv"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Upload CSV File
                          </label>
                        </div>
                         {/* Placeholder text for guidance */}
    <p className="mt-2 text-sm text-gray-600">
      Please upload a CSV file in the format: name,email (e.g., John Doe,johndoe@example.com)
    </p>
    
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule and Content Sections */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleEmail}
                      onChange={() => setScheduleEmail(!scheduleEmail)}
                      id="scheduleEmail"
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="scheduleEmail" className="ml-2 text-sm text-gray-700">
                      Schedule Email
                    </label>
                  </div>
                  {scheduleEmail && (
                    <input
                      type="text"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      placeholder="Enter time to send email (e.g., '5m', '1h')"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Enter email content"
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                           {/* Action Buttons */}
                           <div className="flex justify-end space-x-4">
                {activeTab === 'csv' && file ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sending mails...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                      </>
                    )}
                  </button>
                ) : activeTab === 'manual' && recipients.length > 0 ? (
                  <button
                    onClick={handleSendEmails}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Emails
                  </button>
                ) : null}
            </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    
  );
};

export default Demo;
