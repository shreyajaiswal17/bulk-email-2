import React from "react";
import Demo from "./Demo";
import EmailAnalyticsDashboard from "./EmailAnalytics";

const Homepage = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 text-white">
        {/* Navbar */}
        <header className="flex justify-between items-center px-6 py-4 bg-indigo-700 shadow-lg">
          <h1 className="text-3xl font-extrabold text-yellow-400">Mega Mailer</h1>
          <nav className="flex gap-6 text-lg">
            <a href="#features" className="hover:text-yellow-300">Features</a>
            <a href="#upload" className="hover:text-yellow-300">Upload</a>
            <a href="#contact" className="hover:text-yellow-300">Contact</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-5xl font-extrabold mb-6">
            Effortlessly <span className="text-yellow-400">Reach Thousands</span>
          </h1>
          <p className="text-lg max-w-3xl">
            Mega Mailer is the ultimate bulk email solution to simplify your email campaigns, manage schedules, and maximize reach. Perfect for businesses and individuals alike!
          </p>
          <a
            href="#upload"
            className="mt-8 bg-yellow-400 text-indigo-700 font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition duration-200"
          >
            Get Started
          </a>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white text-gray-800 py-16 px-6">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-indigo-700">
            Features You'll Love
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-500">Bulk Email Sending</h3>
              <p>Send emails to thousands of recipients in just a few clicks.</p>
            </div>
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-500">Scheduling Options</h3>
              <p>Plan your campaigns ahead by scheduling emails for the perfect time.</p>
            </div>
           
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-500">Send Personalized Emails</h3>
              <p>Craft personalized emails for each recipient to enhance engagement and response rates.</p>
            </div>
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-500">Advanced Email Tracking</h3>
              <p>Track your email campaigns with detailed analytics, including the number of opens, clicks, and successful deliveries.</p>
            </div>
            <div className="text-center p-6 bg-gray-100 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-yellow-500">Flexible Recipient Management</h3>
              <p>Upload recipients through a CSV file or manually input them to easily manage your email lists.</p>
            </div>
          </div>
        </section>

        {/* File Upload Section */}
        <section id="upload" className="flex flex-col items-center justify-center py- 20 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white">
          <h2 className="text-4xl font-extrabold mb-8">
            Upload Your Email List or Add Content
          </h2>
        </section>
      </div>

      <Demo />
      <EmailAnalyticsDashboard />

      {/* Footer Section */}
      <footer className="bg-indigo-700 text-white py-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2">© 2025 Mega Mailer. All rights reserved.</p>
          <nav className="flex justify-center gap-4">
            <a href="#features" className="hover:text-yellow-300">Features</a>
            <a href="#upload" className="hover:text-yellow-300">Upload</a>
            <a href="#contact" className="hover:text-yellow-300">Contact</a>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default Homepage;