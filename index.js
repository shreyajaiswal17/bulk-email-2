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

// Initialize Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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'; // Replace with your Brevo API key
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

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to add a user to Brevo contacts and send transactional email
const addUserToBrevo = async (name, email) => {
  const contactData = {
    email,
    attributes: { FIRSTNAME: name },
    listIds: [7], // Replace with your Brevo list ID
    updateEnabled: true, // Enables updating if contact already exists
  };

  try {
    // Add the user to Brevo's contact database
    const response = await contactsApi.createContact(contactData);
    console.log(`User added to Brevo: ${email}`, response);

    // Send a transactional email to the user
    const sendSmtpEmail = {
      sender: { email: 'lavanya.varshney2104@gmail.com', name: 'Lavanya Varshney' },
      to: [{ email }],
      subject: 'Welcome to Our Service!',
      htmlContent: '<h1>Welcome to Our Service!</h1><p>Click <a href="https://example.com">here</a> to visit our site.</p><img src="https://localhost:3000/tracking-pixel?email=${cleanedEmail}" width="1" height="1" />',
    };

    // Send the email
    const emailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Transactional email sent to:', email, emailResponse);

    // Return email response for tracking metrics
    return {
      status: 'sent',  // The email was successfully sent
      messageId: emailResponse.messageId, // Store message ID for tracking
      email,
    };

  } catch (error) {
    console.error(`Error processing user ${email}:`, error.response?.body || error.message);
    throw error; // Throw error to be handled by the caller
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

          // Add the user to Brevo's contact database and send transactional email
          const emailMetrics = await addUserToBrevo(cleanedName, cleanedEmail);

          // Log email metrics for manual tracking
          console.log('Email Metrics for user:', cleanedEmail, emailMetrics);

          // Example: Track delivery (success/failure)
          const emailMetricsInDb = {
            email: cleanedEmail,
            status: emailMetrics.status,  // "sent" for successful send
            deliveryTime: new Date(),
            messageId: emailMetrics.messageId,
          };

          // Save email metrics to MongoDB (create a new model for email metrics)
          // Assuming you have a model for EmailMetrics to store metrics in the database
          const emailMetric = new EmailMetrics(emailMetricsInDb);
          await emailMetric.save();

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

        // Log invalid users (if any)
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

// Model to store email metrics (you should define this model in your Mongoose setup)
const emailMetricsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  status: { type: String, required: true },  // 'sent', 'failed', etc.
  deliveryTime: { type: Date, required: true },
  messageId: { type: String, required: true },
});

const EmailMetrics = mongoose.model('EmailMetrics', emailMetricsSchema);

// Route for email click tracking pixel
app.get('/tracking-pixel', async (req, res) => {
  const { email } = req.query; // Capture email from the query params
  if (!email) {
    return res.status(400).send('No email provided for click tracking.');
  }

  try {
    // Check if the email already exists in the database
    let clickEvent = await ClickMetrics.findOne({ email: email });

    if (clickEvent) {
      // If the email exists, increment the clickCount
      clickEvent.clickCount += 1;
      await clickEvent.save();
      console.log(`Click count for ${email} updated to ${clickEvent.clickCount}`);
    } else {
      // If the email doesn't exist, create a new click event
      clickEvent = new ClickMetrics({
        email: email,
        timestamp: new Date(),
        clickCount: 1, // First click
      });
      await clickEvent.save();
      console.log(`New click event for ${email} created with count 1`);
    }

    // Return a 1x1 transparent image to indicate successful tracking
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAUA...', 'base64')); // Transparent 1x1 image
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).send('Error tracking click.');
  }
});


// Model to store click events (you should define this model in your Mongoose setup)
const clickMetricsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  timestamp: { type: Date, required: true },
  clickCount: { type: Number, default: 0 }, // Default value for clickCount
});

const ClickMetrics = mongoose.model('ClickMetrics', clickMetricsSchema);
app.get('/tracking', (req, res) => {
  res.send('Tracking endpoint is working!');
});


// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
