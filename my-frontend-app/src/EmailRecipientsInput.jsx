// EmailRecipientsInput.js
import React, { useState } from 'react';
import { Upload, X, Mail, AlertTriangle } from 'lucide-react';
import { ConversationsMessageFile } from 'sib-api-v3-sdk';
import axios from 'axios'; // Import axios for making API calls
const EmailRecipientsInput = ({ onRecipientsChange }) => {
  const [manualInput, setManualInput] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  
  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const parseManualInput = (input) => {
    const entries = input.split(',').map(entry => entry.trim());
    const parsed = entries.map(entry => {
      const parts = entry.split(/[<>]/).map(part => part.trim());
      if (parts.length === 1) {
        return { email: parts[0], name: '' };
      }
      return { name: parts[0], email: parts[1] || parts[0] };
    });

    const validEntries = parsed.filter(({ email }) => validateEmail(email));
    if (validEntries.length !== parsed.length) {
      setError('Some email addresses were invalid and have been removed');
    } else {
      setError('');
    }

    return validEntries;
  };

  const handleManualInputChange = (e) => {
    setManualInput(e.target.value);
    const parsedRecipients = parseManualInput(e.target.value);
    setRecipients(parsedRecipients);
    onRecipientsChange(parsedRecipients);
  };
  const handleSendEmails = async () => {
    if (recipients.length === 0) {
      setError('No recipients to send emails.');
      return;
    }
let emailList=[];  
    setError('');
   
    try {
        const response = await axios.post('import.meta.env.BACKEND_URL/send-manual-emails', {
       emailList:recipients,
        });
 console.log("emailList",emailList)
  console.log("recipients",recipients)
        if (response.status === 200) {
         
          alert("Emails sent successfully!");
        }
      } catch (error) {
        console.log(error);
        setError('Failed to send emails. Please try again.');
      }
    };
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const parsedRecipients = lines
          .map(line => {
            const [name, email] = line.split(',').map(item => item.trim());
            return { name, email };
          })
          .filter(({ email }) => validateEmail(email));

        setRecipients(parsedRecipients);
        onRecipientsChange(parsedRecipients);
      };
      reader.readAsText(file);
    }
  };

  const removeRecipient = (index) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(updatedRecipients);
    onRecipientsChange(updatedRecipients);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <Mail className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-xl font-semibold">Email Recipients</h2>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 mr-4 focus:outline-none ${
              activeTab === 'manual'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Entry
          </button>
          <button
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'csv'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('csv')}
          >
            CSV Upload
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'manual' ? (
            <div className="space-y-4">
              <textarea
                value={manualInput}
                onChange={handleManualInputChange}
                placeholder="Enter recipients (format: Name <email@example.com>, email2@example.com)"
                className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {error && (
                <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Upload CSV File
                </label>
                <p className="mt-2 text-sm text-gray-500">CSV format: name,email@example.com</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Recipients List ({recipients.length})
        </h3>
        <div className="space-y-2">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>
                {recipient.name && `${recipient.name} `}
                              <span className="text-gray-600">{recipient.email}</span>
              </span>
              <button
                onClick={() => removeRecipient(index)}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
  

<div className="mt-4">
  <button
    onClick={handleSendEmails}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
  >
    Send Emails
  </button>
</div>
</div>
  );
};

export default EmailRecipientsInput;