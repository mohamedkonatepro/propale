import { NextApiRequest, NextApiResponse } from 'next';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

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
    sender: {
      name: "Propale",
      email: process.env.NEXT_PUBLIC_BREVO_FROM_EMAIL || 'ahmed.kante@katech-web.com',
    },
    to,  // Array of { email: string } objects
    subject,
    htmlContent: html,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.NEXT_PUBLIC_BREVO_API_KEY || '',
      },
      body: JSON.stringify(msg),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
