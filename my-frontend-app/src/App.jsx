import React, { useState } from "react";
import FileUploadComponent from "./FileUploadComponent";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles for the editor

function App() {
  const [emailContent, setEmailContent] = useState("");
 

  const handleContentChange = (content) => {
    setEmailContent(content);
  };

  

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/send-email-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({emailContent}),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Email Content sent successfully:", data.message);
        alert("Email content submitted successfully!");
      } else {
        console.error("Failed to send email content");
        alert("Failed to submit email content.");
      }
    } catch (error) {
      console.error("Error submitting email content:", error);
      alert("An error occurred while submitting the email content.");
    }
  };

  return (
    <div className="App">
     
      <h2>Email Content Editor</h2>
      <ReactQuill
        value={emailContent}
        onChange={handleContentChange}
        placeholder="Write your email content here..."
      />
       <button onClick={handleSubmit}>Submit Email Content</button>
       <FileUploadComponent />
    </div>
  );
}

export default App;
