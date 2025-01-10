## Mass Emailing Tool

A MERN stack application to send personalized emails to multiple recipients efficiently. This tool features email scheduling, recipient validation, open rate tracking, and click-through rate tracking, ensuring compliance with email regulations like GDPR and CAN-SPAM.

## 🚀 Features


Personalize content using tags like recipient name or company.

* Recipient Management
Validate recipient lists to remove invalid or duplicate email addresses.
* Scheduling
Schedule emails to be sent at a specific date and time.

* Tracking
Open rate tracking using embedded tracking pixels.

* Ensures emails are not sent to invalid or unsubscribed addresses.

## 🛠️ Tech Stack

* Frontend: React.js
* Axios: To handle API requests.
* Backend: Node.js + Express: For server-side logic and API endpoints.
* Nodemailer: For email sending.

* Database: MongoDB


## Installation and Setup

## Prerequisites-

* Node.js installed on your system.

* MongoDB installed and running locally or accessible via a connection string.

* Backend Setup-

1. Clone the repository:

### `git clone https://github.com/your-username/mass-emailing-tool.git`

2. cd mass-emailing-tool

3. Install dependencies: npm install

4. Set up environment variables in a .env file:

PORT=5000
MONGO_URI=your-mongodb-connection-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password-or-app-password

5. Start the backend server:npm start



## Frontend Setup

1. Navigate to the frontend folder: 
### `cd frontend`
2. Install dependencies:
### ` npm install`


3. Start the frontend server: 
### `npm start`
4. Open your browser and navigate to http://localhost:3000.

# API Endpoints

### Email Scheduling

* POST /schedule-email

* Schedule an email for a future time.

* Request body:

` "recipients": ["example1@gmail.com", "example2@gmail.com"],`
 ` "subject": "Your Subject",`
  `"content": "Email content here",`
  `"scheduleTime": "2025-01-09T12:00:00Z" `

### Recipient Validation

* POST /validate-recipients

* Validates a list of email addresses and removes invalid or duplicate entries.





## 🤝 Contributing

Contributions, issues, and feature requests are welcome!


Steps to contribute:

1.Fork the repository.

2.Create a new branch:

### `git checkout -b feature/YourFeatureName`

3.Commit your changes and push them to the branch.

4.Open a pull request.





### License

This project is licensed under the MIT License.