# Email Notification Setup

The app now includes email notification functionality that sends claim details to `stete@risk.co.rs` when you click the "Pošalji email" button.

## Environment Variables

Add these to your `.env` file (locally) and Netlify environment variables (production):

### For Gmail SMTP:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
NOTIFICATION_EMAIL=stete@risk.co.rs
```

### Getting Gmail App Password:
1. Go to your Google Account settings
2. Security → 2-Step Verification (must be enabled)
3. App passwords
4. Select "Mail" and "Other" → Generate
5. Copy the 16-character password
6. Use this as `SMTP_PASS`

### Alternative SMTP Providers:

#### SendGrid (Recommended for production):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-sender@domain.com
NOTIFICATION_EMAIL=stete@risk.co.rs
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM=your-verified-sender@domain.com
NOTIFICATION_EMAIL=stete@risk.co.rs
```

## Netlify Configuration

1. Go to Netlify dashboard → Site settings → Environment variables
2. Add all SMTP variables listed above
3. Redeploy the site

## Testing Locally

1. Update `.env` with your SMTP credentials
2. Run `npm run dev`
3. Fill in a claim form
4. Click "Pošalji email" button
5. Check the recipient email inbox

## Email Format

The email includes:
- Basic claim information (osiguranik, polisa, etc.)
- Damage details (vrsta štete, uzrok, veterinar)
- Daily damage records table
- Summary statistics (total deaths, average, percentage)

## Troubleshooting

**Email not sending:**
- Check SMTP credentials are correct
- For Gmail, ensure "Less secure app access" is enabled OR use App Password
- Check Netlify environment variables are set
- Look at server logs for error messages

**Authentication failed:**
- Gmail: Use App Password, not regular password
- Verify 2FA is enabled for Gmail
- Check username/password don't have extra spaces

**Connection timeout:**
- Try port 465 with `secure: true` instead of 587
- Check firewall isn't blocking SMTP ports
