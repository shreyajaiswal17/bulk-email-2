const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const SibApiV3Sdk = require('sib-api-v3-sdk'); // Brevo SDK
const User = require('./models/User'); // MongoDB User model
const cors = require('cors');
const axios = require('axios'); // For tracking clicks
const { generateToken, verifyToken } = require('./login'); // Adjust the path to your JWT file
const { appendFile } = require('fs/promises');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;
const emailTracking = {}; // { email: { delivered: count, clicked: count } }
app.use(cors());
app.use(express.json());
app.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword  } = req.body;
  console.log(req.body); // Log the request body to debug
  if (!name || !email || !password || !confirmPassword ) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword); // Debugging to check if hash is working correctly
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(newUser);

    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    console.log('Password:', password);
  console.log('Hashed Password from DB:', user.password);

    // Validate password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = generateToken(user);
    
    // Send the token back to the client
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route to fetch current user's details using the token
app.get('/current-user', async (req, res) => {
  const token = req.headers['authorization'];  // Assuming the token is sent in the Authorization header

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Verify and decode the token to extract user data
    const decoded = verifyToken(token);

    // Find the user from the database based on the decoded email (or other unique identifier)
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Send the current user's data back as a response
    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});
const checkIfSenderExists = async (email) => {
  const apiKey = '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'; // Replace with your actual Brevo API key
  const url = 'https://api.brevo.com/v3/senders'; // Endpoint to get the list of senders

  try {
    const response = await axios.get(url, {
      headers: {
        'api-key': apiKey,
      },
    });

    // Check if the email exists in the list of senders
    return response.data.senders.some(sender => sender.email === email);
  } catch (error) {
    console.error('Error fetching senders:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch senders');
  }
};
app.post('/add-verified-sender', async (req, res) => {
  const token = req.headers['authorization'];  // Assuming the token is sent in the Authorization header

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Verify the token and decode the user's email
    const decoded = verifyToken(token);
    const userEmail = decoded.email;

    if (!userEmail) {
      return res.status(400).json({ message: 'Email not found in token' });
    }
   // Check if the sender already exists
   const senderExists = await checkIfSenderExists(userEmail);
   if (senderExists) {
    return res.status(200).json({ message: 'Sender already verified, ready to send emails.' });
   }

    // Make API request to Brevo to add the sender
    const apiKey = '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';  // Replace with your actual Brevo API key
    const url = 'https://api.brevo.com/v3/senders'; // Endpoint to create a new sender

    // Request to add the current user as a verified sender in Brevo
    const response = await axios.post(url, 
      {
        email: userEmail, 
        name: decoded.name || "Unknown"  // Adding user's name (if available)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    // Handle successful response from Brevo
    res.status(200).json({ message: 'Sender added and verified successfully', data: response.data });
    console.log("userEmail",userEmail)
  } catch (error) {
    console.error('Error adding sender:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to add sender' });
  }
});
const processedEvents = new Set();
app.post('/webhook', async(req, res) => {
  const eventData = req.body;
  console.log(eventData);
  const { event, email, 'message-id': messageId } = eventData;
  if (!emailTracking[email]) {
    emailTracking[email] = { delivered: 0, clicked: 0, opened: 0 };
  }
  if (event === 'delivered') {
    emailTracking[email].delivered += 1;

    console.log(`Email ${email} with Message ID ${messageId} was delivered.`);
    // Perform actions when email is delivered, such as updating a record or notifying the user.
  }
    if(event === 'click')
  {
    emailTracking[email].clicked += 1;
    console.log(`Email ${email} with Message ID ${messageId} clicked.`);
      }
      if(event === 'unique_opened'){
        emailTracking[email].opened += 1;
        
        console.log(`Email ${email} with Message ID ${messageId} was opened.`);
       
      }
      if(event === 'unsubscribed'){
        console.log(`Email ${email} with Message ID ${messageId} was unsubscribed.`);
        await User.findOneAndUpdate({ email }, { subscribed: false })
      }
  
  res.status(200).send('Webhook received');
});


// Example of setting dynamic email content with a placeholder
dynamicEmailContent = `
  <h1>Welcome, {{name}}!</h1>
  <p>Thank you for joining us. We are excited to have you!</p>
`; 

// Initialize Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';// Replace with your Brevo API key

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Connect to MongoDB
// Connect to MongoDB Atlas
mongoose.set('bufferCommands', false); // Disable buffering
mongoose.connect('mongodb+srv://Lavanya:RxqvMSu1Yj8euerR@cluster0.2arb0.mongodb.net/csv-upload?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 50000, // 5 seconds timeout
  heartbeatFrequencyMS: 20000,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

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
  } 

  try {
    console.log('Received email content:', emailContent);
    res.status(200).json({ message: 'Email content updated successfully' });

  
  } catch (error) {
    console.error('Error processing email content:', error);
    res.status(500).json({ message: 'An error occurred while processing the email content.' });
  }
});
app.get('/open-rate',async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const rates = Object.entries(emailTracking).map(([email, { delivered, opened }]) => {
    const effectiveDelivered = delivered || totalUsers; 
    const openRate = effectiveDelivered > 0 ? ((opened / effectiveDelivered) * 100).toFixed(2) : 0;
    return { email, delivered: effectiveDelivered , opened, openRate: `${openRate}%` };
  });

  res.status(200).json(rates);
});

app.get('/click-rate', async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const rates = Object.entries(emailTracking).map(([email, { delivered, clicked }]) => {
    const effectiveDelivered = delivered || totalUsers; // Fallback to total user count if delivered is 0
    const clickRate = effectiveDelivered > 0 ? ((clicked / effectiveDelivered) * 100).toFixed(2) : 0;
    return { email, delivered: effectiveDelivered, clicked, clickRate: `${clickRate}%` };
  });

  res.status(200).json(rates);
});

// Modified Unsubscribe endpoint to accept email as query parameter
app.get('/unsubscribe', async (req, res) => {
  const { email } = req.query;

  console.log('Received email:', email); // Log the email received
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { subscribed: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `You have successfully unsubscribed from our emails.` });
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    res.status(500).json({ message: 'Error processing the unsubscribe request.' });
  }
});


// Helper function to send email
// Helper function to send email and notify the webhook for analytics
const sendEmailAndNotifyWebhook = async ( senderName,recipientEmail,recipientName) => {
  try {
   // const messageId = generateUniqueMessageId();  // Implement this to generate a unique message ID
    // Replace {{name}} placeholder with the actual user name
        // Check if the user is subscribed before sending the email
   
    //const personalizedEmailContent = dynamicEmailContent
    //const personalizedEmailContent = dynamicEmailContent.replace('{{email}}', recipientEmail);
 // Replace {{name}} placeholder with the actual user name
 const personalizedEmailContent = dynamicEmailContent.replace('{{name}}', recipientName);
    const sendSmtpEmail = {
      sender: {  email: "lavanya.varshney2104@gmail.com", name: senderName },
      to: [{  email: recipientEmail }],
      subject: 'Welcome Email',
      htmlContent: personalizedEmailContent,
      headers: {
        'X-Tracking-Open': 'true', // Enable open tracking
        'X-Tracking-Click': 'true' // Enable click tracking (if needed)
      },
    };

    const emailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent:', emailResponse);

    // After sending the email, notify the webhook with the email analytics
   const messageId = emailResponse.messageId; // Assuming this is the message ID returned by Brevo API
    const webhookData = {
      event: 'clicked', // You can track other events like 'opened', 'delivered', etc.
      email: recipientEmail,
     'message-id': messageId,
    };

    // Send the email analytics data to your webhook
    await axios.post('http://localhost:3000/webhook', webhookData);
    console.log(`Webhook notified for email ${recipientEmail} with Message ID ${messageId}`);

  } catch (error) {
    console.error('Error sending email or notifying webhook:', error);
  }
};
app.post('/send-manual-emails', async (req, res) => {
  const token = req.headers['authorization'];  // Get the token from the headers
  console.log(token);
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }
// Remove "Bearer " prefix if present
const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  let decoded;
  try {
    decoded = verifyToken(tokenWithoutBearer); 
    console.log(decoded);// Verify the token to get user info
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const { emailList, scheduleEmail, scheduleTime} = req.body; // Add scheduling options
  console.log("emailList", emailList);
  const emailContent = req.body.emailContent; // Access the email content
  console.log('Email content received:', emailContent);

  dynamicEmailContent = emailContent; // Set the email content
  if (!Array.isArray(emailList) || emailList.length === 0) {
    return res.status(400).json({ message: 'Invalid email list provided.' });
  }

  const validEmails = [];
  const invalidEmails = [];

  // Validate email list
  emailList.forEach(({ name, email }) => {
    if (name && email && isValidEmail(email)) {
      validEmails.push({ name: name.trim(), email: email.trim() });
    } else {
      invalidEmails.push({ name, email });
    }
  });

  if (validEmails.length === 0) {
    return res.status(400).json({ message: 'No valid emails provided.', invalidEmails });
  }

  try {
    // Process each valid email
    const emailPromises = validEmails.map(async ({ name, email }) => {
      // Check if user already exists in the database
      if (email !== "lavanya.varshney2104@gmail.com") {
      const existingUser = await User.findOne({ email: email });
         if (!existingUser) {
        // Add user to the database if they don't already exist
        const newUser = new User({
          name: name,
          email: email,
          subscribed: true, // Assuming the user is subscribed by default
        });
       
        await newUser.save();
        console.log(`User added to database: ${name}, ${email}`);
      }
      
      else {
        // Log to the console instead of alert
        throw new Error(`User already exists: ${name}, ${email}`);
  
       
      }
    }
      if (scheduleEmail && scheduleTime) {
        // If scheduling is enabled, calculate delay and schedule the email
        const delay = parseScheduleTime(scheduleTime);
        if (delay !== null) {
          setTimeout(async () => {
            await sendEmailAndNotifyWebhook(decoded.name,email,name);
            console.log(`Scheduled email sent to ${email} after ${scheduleTime}`);
          }, delay);
        } else {
          console.log(`Invalid schedule time for ${email}. Email not scheduled.`);
        }
      } else {
        // Send email immediately if no scheduling is set
        await sendEmailAndNotifyWebhook(decoded.name,email,name);
      }
    });

    // Wait for all email sending tasks to complete
    await Promise.all(emailPromises);

    res.status(200).json({
      message: 'Emails sent successfully to valid recipients.',
      validEmails,
      invalidEmails,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Error sending emails.', error });
  }
});

// Middleware to check if email content is set
const checkEmailContent = (req, res, next) => {
  if (!dynamicEmailContent) {
    return res.status(400).json({ message: 'Email content must be set before uploading CSV.' });
  }
  next();
};
// Route to upload CSV file and create a campaign
 app.post('/upload-csv',  upload.single('csvFile'), async (req, res) => {
  const token = req.headers['authorization'];  // Get the token from the headers
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }
// Remove "Bearer " prefix if present
console.log(token);
const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  let decoded;
  try {
    decoded = verifyToken(tokenWithoutBearer); // Verify the token to get user info
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const emailContent = req.body.emailContent; // Access the email content
  console.log('Email content received:', emailContent);

  dynamicEmailContent = emailContent; // Set the email content
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
          if (cleanedEmail !== "lavanya.varshney2104@gmail.com") {
          const existingUser = await User.findOne({ email: cleanedEmail });
          if (existingUser) {
            console.log(`Duplicate email found: ${cleanedEmail}`);
            continue; // Skip if the email already exists
          }
        
          // If no duplicate, add user to the valid array
          validUsers.push({ name: cleanedName, email: cleanedEmail });
        }
        // Schedule the email if scheduling parameters are provided
        if (req.body.scheduleEmail && req.body.scheduleTime) {
          const delay = parseScheduleTime(req.body.scheduleTime);
          if (delay !== null) {
            setTimeout(async () => {
              await sendEmailAndNotifyWebhook(decoded.name, cleanedEmail,cleanedName);
              console.log(`Scheduled email sent to ${cleanedEmail} after ${req.body.scheduleTime}`);
            }, delay);
          } else {
            console.log(`Invalid schedule time for ${cleanedEmail}. Email not scheduled.`);
          }
        } else {
          // Send email immediately if no schedule is set
          await sendEmailAndNotifyWebhook(decoded.name, cleanedEmail,cleanedName);
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
