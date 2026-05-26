const { Resend } = require('resend');

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('RESEND_API_KEY not set. Email functionality will be disabled.');
}

const sendContactEmail = async (req, res) => {
  try {
    // Check if Resend is available
    if (!resend) {
      return res.status(503).json({ error: 'Email service is not configured. Please set RESEND_API_KEY.' });
    }

    // ✅ Include 'organization' field
    const { firstName, lastName, email, organization, message } = req.body;

    // Validation (all except organization are required)
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'First name, last name, email, and message are required.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Optional: Trim organization if provided
    const orgText = organization && organization.trim() !== ''
      ? `<p><strong>Organization / Institution:</strong> ${escapeHtml(organization.trim())}</p>`
      : '';

    // Prepare email HTML
    const htmlContent = `
      <h2>New Collaboration Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${orgText}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <hr />
      <p><em>Sent from your AI-Powered Lost Person & Car Detection System contact form.</em></p>
    `;

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: 'Your App <onboarding@resend.dev>', // Replace with your verified domain
      to: [process.env.ADMIN_EMAIL],
      subject: `New collaboration request from ${firstName} ${lastName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email.' });
    }

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Simple helper to prevent XSS in email content
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { sendContactEmail };