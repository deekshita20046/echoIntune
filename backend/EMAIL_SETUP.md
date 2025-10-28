# Email Setup for Contact Form

The contact form allows users to send messages directly to you (the developer) via email.

## Configuration

Add the following environment variables to your `.env` file in the backend directory:

```env
# Email Configuration for Contact Form
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
DEVELOPER_EMAIL=your-email@gmail.com
```

## Gmail Setup (Recommended)

If you're using Gmail, you'll need to create an App Password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already)
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Use this password as `EMAIL_PASSWORD` in your `.env` file

## Alternative Email Services

You can also use other email services by modifying the transporter configuration in `/backend/routes/contact.js`:

### For Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

### For Custom SMTP:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

## Testing

1. Start your backend server: `npm run dev`
2. Go to the Landing page contact section
3. Fill out the form and submit
4. Check your email inbox for the message

## Troubleshooting

- **"Invalid login"**: Make sure you're using an App Password, not your regular Gmail password
- **"Connection timeout"**: Check your firewall settings or try a different SMTP port
- **No email received**: Check your spam folder and verify the `DEVELOPER_EMAIL` is correct

