import { Profile } from "@/types/models";

export const sendEmailByContacts = async (contacts: Profile[], content: string, subject: string, space: boolean = true, user?: Profile) => {
  if (!contacts || contacts.length === 0) {
    console.error('No contacts provided for sending email');
    return;
  }

  const emailObjects = contacts
    .map(contact => contact.email)  // Extract emails
    .filter(Boolean)                // Remove any falsy values
    .map(email => ({ email }));     // Transform each email into an object

  if (emailObjects.length === 0) {
    console.error('No valid emails found in contacts');
    return;
  }

  const formattedContent = content.replace(/\n/g, `${space ? "<br>" : ""}`);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailObjects,
        cc: user?.email ? [{ email: user.email }] : [],
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

export const sendEmail = async (
  contactsEmail: string[],
  content: string,
  subject: string,
  space: boolean = true,
) => {
  if (!contactsEmail || contactsEmail.length === 0) {
    console.error("No email addresses provided for sending email");
    return;
  }

  // Filter and format valid email addresses
  const emailObjects = contactsEmail
    .filter(Boolean) // Remove falsy values
    .map((email) => ({ email })); // Transform each email into an object

  if (emailObjects.length === 0) {
    console.error("No valid email addresses found");
    return;
  }

  // Format the email content
  const formattedContent = content.replace(/\n/g, space ? "<br>" : "");

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/sendEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: emailObjects,
        subject,
        html: formattedContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send emails");
    }

    console.log("Emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

