import { Profile } from "@/types/models";

export const sendEmailByContacts = async (contacts: Profile[], content: string, subject: string) => {
  if (!contacts || contacts.length === 0) {
    console.error('No contacts provided for sending email');
    return;
  }

  const emails = contacts.map(contact => contact.email).filter(Boolean); // Extract emails and remove any falsy values
  if (emails.length === 0) {
    console.error('No valid emails found in contacts');
    return;
  }

  const formattedContent = content.replace(/\n/g, '<br>');

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}//api/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emails,
        subject,
        html: formattedContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send emails');
    }

    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
  }
};
