import React, { useState } from "react";

const FileUploadComponent = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  // Handle file change
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("❌ Please select a file to upload.");
      return;
    }

    setStatus("Uploading...");

    // Simulate successful upload
    setTimeout(() => {
      setStatus("✅ File uploaded successfully!");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 py-10 px-6 text-white">
      {/* Header Section */}
      <h1 className="text-5xl font-extrabold mb-10 text-center">
        <span className="text-yellow-400">MegaMailer</span> - Bulk Email Sender
      </h1>

      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-gray-800 max-w-4xl w-full">
        {/* File Upload Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-indigo-600">
            Upload Your CSV File
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            Effortlessly send personalized emails to thousands of recipients with scheduling options.
          </p>
          <label
            htmlFor="csvFile"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Select a File to Upload:
          </label>
          <input
            type="file"
            name="csvFile"
            id="csvFile"
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onChange={handleFileChange}
          />
        </div>

        {/* Content Section */}
        <div className="mb-8 border-t border-gray-300 pt-6">
          <form onSubmit={handleSubmit}>
            {/* Schedule Email Option */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2 text-lg font-medium text-gray-700">
                  Schedule Emails
                </span>
              </label>
            </div>

            {/* Schedule Time Input */}
            {scheduleEmail && (
              <div className="mb-4">
                <label
                  htmlFor="scheduleTime"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Schedule Time (e.g., 5m for 5 minutes, 1h for 1 hour):
                </label>
                <input
                  type="text"
                  name="scheduleTime"
                  id="scheduleTime"
                  placeholder="e.g., 5m, 1h"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Upload and Send
            </button>
          </form>

          {/* Status Message */}
          {status && (
            <p className="mt-4 text-lg font-medium text-indigo-600">{status}</p>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-12 text-center">
        <h2 className="text-4xl font-extrabold">
          <span className="text-yellow-400">Simplify</span> Your Email Campaigns
        </h2>
        <p className="text-lg mt-4 text-gray-200">
          Effortlessly manage, schedule, and track your bulk emails with ease!
        </p>
      </div>
    </div>
  );
};

export default FileUploadComponent;
