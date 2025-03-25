import { Profile } from "@/types/models";
import { ExternalRepository, EmailRecipient } from '@/repositories/externalRepository';
import { ValidationError, logError, handleValidationError } from '@/utils/errors';
import { validateSendEmailData, validateSendEmailByContactsData } from '@/validation/emailValidation';

export const sendEmailByContacts = async (contacts: Profile[], content: string, subject: string, space: boolean = true, user?: Profile): Promise<void> => {
  try {
    // Validation des données d'entrée
    const validatedData = validateSendEmailByContactsData({
      contacts,
      content,
      subject,
      space,
      user
    });

    const emailObjects: EmailRecipient[] = validatedData.contacts
      .map(contact => contact.email)
      .filter(Boolean)
      .map(email => ({ email }));

    const formattedContent = validatedData.content.replace(/\n/g, `${validatedData.space ? "<br>" : ""}`);

    await ExternalRepository.sendEmail({
      to: emailObjects,
      cc: validatedData.user?.email ? [{ email: validatedData.user.email }] : [],
      subject: validatedData.subject,
      html: formattedContent,
    });

    console.log('Emails sent successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      handleValidationError(error);
    }
    logError(error, 'EmailService/sendEmailByContacts');
    throw error;
  }
};

export const sendEmail = async (
  contactsEmail: string[],
  content: string,
  subject: string,
  space: boolean = true,
): Promise<void> => {
  try {
    // Validation des données d'entrée
    const validatedData = validateSendEmailData({
      contactsEmail,
      content,
      subject,
      space
    });

    const emailObjects: EmailRecipient[] = validatedData.contactsEmail.map((email) => ({ email }));
    const formattedContent = validatedData.content.replace(/\n/g, validatedData.space ? "<br>" : "");

    await ExternalRepository.sendEmail({
      to: emailObjects,
      subject: validatedData.subject,
      html: formattedContent,
    });

    console.log("Emails sent successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      handleValidationError(error);
    }
    logError(error, 'EmailService/sendEmail');
    throw error;
  }
};

