import { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export default async function sendEmail(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const msg = {
    to, // Array of emails or single email
    from: process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL || '',
    subject,
    html,
  };

  try {
    await sgMail.sendMultiple(msg); // sendMultiple supports arrays of recipients
    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
