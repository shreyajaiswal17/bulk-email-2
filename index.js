const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const SibApiV3Sdk = require('sib-api-v3-sdk'); // Brevo SDK
const User = require('./models/User'); // MongoDB User model
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(cors())
// Initialize Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey =process.env.BREVO_API_KEY; // Replace with your Brevo API key

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

// Route to upload CSV file
app.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log('File received:', req.file); // This will log the file info
  const filePath = req.file.path;
  const users = [];

  // Parse the CSV file
  fs.createReadStream(filePath)
  .pipe(csvParser({ headers: ['name', 'email'] })) // Explicitly set headers
  .on('data', (row) => {
    console.log("Row data:", row);  // Log the row to check if the entire data is parsed
    const { name, email } = row; 
    console.log("name:", name);
    console.log("email:", email);

    const cleanedName = name ? name.trim() : '';
    const cleanedEmail = email ? email.trim() : '';

    if (!cleanedName || !cleanedEmail) {
      console.log('Invalid data:', row);
      return;
    }
    
    users.push({ name: cleanedName, email: cleanedEmail });
  })
    .on('end', async () => {
      console.log('CSV Parsing Finished');
      // After parsing, save users to MongoDB
      try {
        await User.insertMany(users);
        console.log('Users successfully added to the database!');

        // Send welcome email to each user
        for (const user of users) {
          const sendSmtpEmail = {
            sender: { email: 'lavanya.varshney2104@gmail.com', name: 'Lavanya Varshney' }, // Your sender email
            to: [{ email: user.email, name: user.name }],
            subject: 'Welcome to Our Service!',
            htmlContent: `<h1>Hi ${user.name}!</h1><p>Thank you for signing up.</p>`,
          };

          try {
            const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log(`Welcome email sent to ${user.email}:`, response);
          } catch (error) {
            console.error('Error sending email to', user.email, error);
          }
        }

        res.status(200).json({ message: 'Users successfully added to the database.' });
      } catch (error) {
        console.error('Error inserting into MongoDB:', error);
        res.status(500).json({ message: 'Error saving users to the database' });

      }
    });
});

// Serve static files (for example, uploaded CSVs)
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
