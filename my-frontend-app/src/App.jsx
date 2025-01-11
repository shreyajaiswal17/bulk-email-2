import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import SimpleMDE from "react-simplemde-editor";
import { Upload, Clock, Send, Mail } from "lucide-react";
import "simplemde/dist/simplemde.min.css";
import "./index.css"; // Adjust with your CSS file path
import Homepage from "./Homepage";
const App = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
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
    formData.append("emailContent", emailContent);  // Include the email content here
    try {

      const response = await fetch("http://localhost:3000/upload-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("File uploaded successfully!");
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("Failed to upload file.");
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
        body: JSON.stringify({  emailContent }),
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

  const editorOptions = useMemo(() => ({
    spellChecker: true,
    placeholder: "Write your email content here using markdown...",
    status: false,
    toolbar: [
      "bold",
      "italic",
      "heading",
      "|",
      "quote",
      "unordered-list",
      "ordered-list",
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
      "|",
      "guide",
    ],
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Homepage/>
      
    

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
         

          {/* Email Content Editor */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Email Content Editor</h2>

            <SimpleMDE
              value={emailContent}
              onChange={setEmailContent}
              options={editorOptions}
            />

            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-2">Live Preview:</h3>
              <div className="prose">
                <ReactMarkdown>{emailContent}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Form for CSV Upload */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
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
              <div
                className={`text-sm ${
                  status.includes("Error") ? "text-red-600" : "text-green-600"
                }`}
              >
                {status}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload CSV"}
              </button>

              <button
                type="button"
                onClick={handleEmailContentSubmit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Email Content
              </button>
            </div>
          </form>
        </div>
      </main>
      <footer id="contact" className="bg-indigo-700 py-6 text-center text-gray-200">
        <p>© 2025 Bulk Mailer. All rights reserved.</p>
        <p className="mt-2">
          <a href="#home" className="hover:text-yellow-300">
            Back to Top
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
