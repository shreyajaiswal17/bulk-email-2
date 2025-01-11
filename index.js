const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const SibApiV3Sdk = require('sib-api-v3-sdk'); // Brevo SDK
const User = require('./models/User'); // MongoDB User model
const cors = require('cors');
const axios = require('axios'); // For tracking clicks

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Dynamic email content
let dynamicEmailContent = `
  <h1>Welcome to Our Service, {{name}}!</h1>
  <p>Your registered email is: {{email}}</p>
  <p>We're excited to have you on board.</p>
  <p>Best regards, <br> The Team</p>
`;


// Initialize Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = 'api key';// Replace with your Brevo API key
const contactsApi = new SibApiV3Sdk.ContactsApi();
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/csv-upload', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Helper function to convert schedule time into milliseconds
const parseScheduleTime = (time) => {
  const regex = /(\d+)([smh])/; // Regex to match numbers with time units (seconds, minutes, hours)
  const match = time.match(regex);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let delay = 0;
  switch (unit) {
    case 's':  // seconds
      delay = value * 1000;
      break;
    case 'm':  // minutes
      delay = value * 60 * 1000;
      break;
    case 'h':  // hours
      delay = value * 60 * 60 * 1000;
      break;
    default:
      return null;
  }

  return delay;
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Endpoint to set dynamic email content
app.post('/send-email-content', async (req, res) => {
  const { emailContent, scheduleEmail, scheduleTime } = req.body;
  if (emailContent) {
    dynamicEmailContent = emailContent; // Save the email content for later use
  } else {
    // Default personalized message
    dynamicEmailContent = '<h1>Welcome, {{name}}!</h1><p>This is your personalized content. Feel free to explore!</p>';
  }

  try {
    console.log('Received email content:', emailContent);
    res.status(200).json({ message: 'Email content updated successfully' });

  
  } catch (error) {
    console.error('Error processing email content:', error);
    res.status(500).json({ message: 'An error occurred while processing the email content.' });
  }
});

// Helper function to send email
const sendEmail = async (name,email) => {
  try {
     // Replace {{name}} placeholder with the actual user name
     const personalizedEmailContent = dynamicEmailContent
     .replace('{{name}}', name)
     .replace('{{email}}', email); // You can replace other placeholders too
    const sendSmtpEmail = {
      sender: { email: 'lavanya.varshney2104@gmail.com', name: 'Lavanya Varshney' },
      to: [{email}],
      subject: 'Welcome Email',
      htmlContent: personalizedEmailContent,
    };
    const emailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent:', emailResponse);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Route to upload CSV file and create a campaign
 app.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log('File received:', req.file);
  const filePath = req.file.path;
  const validUsers = [];
  const invalidUsers = [];
  let dynamicEmailContent = req.body.emailContent || dynamicEmailContent;  // Use uploaded content or default
  // Parse the CSV file
  const rows = [];
  fs.createReadStream(filePath)
    .pipe(csvParser({
      separator: ',',  // Specify the delimiter (comma)
      quote: '"',      // Specify the quote character
      headers: ['name', 'email'] // Explicitly define the headers
    }))
    .on('data', (row) => {
      rows.push(row);  // Collect all rows first
    })
    .on('end', async () => {
      console.log('CSV Parsing Finished');
      
      // Process each row after CSV parsing is complete
      for (const row of rows) {
        const { name, email } = row;
        const cleanedName = name ? name.trim() : '';
        const cleanedEmail = email ? email.trim() : '';

        if (!cleanedName || !cleanedEmail || !isValidEmail(cleanedEmail)) {
          console.log('Invalid data:', row);
          invalidUsers.push(row); // Store invalid users
          continue; // Skip invalid rows
        }

        try {
          // Check for duplicate email in MongoDB
          const existingUser = await User.findOne({ email: cleanedEmail });
          if (existingUser) {
            console.log(`Duplicate email found: ${cleanedEmail}`);
            continue; // Skip if the email already exists
          }

          // If no duplicate, add user to the valid array
          validUsers.push({ name: cleanedName, email: cleanedEmail });
        // Schedule the email if scheduling parameters are provided
        if (req.body.scheduleEmail && req.body.scheduleTime) {
          const delay = parseScheduleTime(req.body.scheduleTime);
          if (delay !== null) {
            setTimeout(async () => {
              await sendEmail(cleanedName,cleanedEmail);
              console.log(`Scheduled email sent to ${cleanedEmail} after ${req.body.scheduleTime}`);
            }, delay);
          } else {
            console.log(`Invalid schedule time for ${cleanedEmail}. Email not scheduled.`);
          }
        } else {
          // Send email immediately if no schedule is set
          await sendEmail(cleanedName,cleanedEmail);
        }
        
        } catch (error) {
          console.error('Error processing user:', error);
        }
      }

      // After processing, save valid users to MongoDB
      try {
        if (validUsers.length > 0) {
          await User.insertMany(validUsers);
          console.log('Users successfully added to the database!');
          res.status(200).json({
            message: 'Users added successfully.',
            validUsers,
            invalidUsers,
          });
        } else {
          res.status(400).json({ message: 'No valid users to add.' });
        }

        if (invalidUsers.length > 0) {
          console.log('Invalid Users:', invalidUsers);
        }
      } catch (error) {
        console.error('Error inserting into MongoDB:', error);
        res.status(500).json({ message: 'Error saving users to the database' });
      }
    })
    .on('error', (error) => {
      console.error('Error parsing CSV file:', error);
      res.status(500).json({ message: 'Error parsing CSV file' });
    });
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
