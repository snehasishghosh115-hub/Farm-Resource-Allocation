require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio initialization (optional)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for OTPs
const otpStore = {};

// Root route
app.get('/', (req, res) => {
    res.send('AgriOptima Auth Server is running.');
});

// Endpoint to send OTP
app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Valid 10-digit phone number is required.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store it in memory
    otpStore[phone] = {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
    };

    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        // Send real SMS
        twilioClient.messages.create({
            body: `Your AgriOptima login code is: ${otp}. Do not share this code.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}` // Assuming India for demo purposes
        }).then(message => {
            console.log(`💬 REAL SMS SENT: Twilio MSG SID ${message.sid}`);
        }).catch(err => {
            console.error(`❌ TWILIO ERROR:`, err);
        });
    } else {
        // Simulate sending OTP by printing to console
        console.log(`\n========================================`);
        console.log(`📲 SMS SIMULATION (Twilio not configured)`);
        console.log(`To: +91 ${phone}`);
        console.log(`Message: Your AgriOptima login code is: ${otp}. Do not share this code.`);
        console.log(`========================================\n`);
    }

    res.json({ success: true, message: 'OTP sent successfully.' });
});

// Endpoint to verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required.' });
    }

    // Bypass check for hackathon testing
    // Remove OTP from memory if it actually exists
    if (otpStore[phone]) {
        delete otpStore[phone];
    }

    // Always success for demo!
    const token = "mock-jwt-token-" + Math.random().toString(36).substring(2);

    res.json({
        success: true,
        token: token,
        user: {
            phone: phone,
            name: "Farmer User",
            role: "Farmer"
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Auth Server running on http://localhost:${PORT}`);
});
