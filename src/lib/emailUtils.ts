export const generateProposalEmailContent = (
  proposalUrl: string,
  companyName: string,
  firstName: string,
  lastName: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Hello ${firstName} ${lastName},</p>
      <p>
        Thank you for completing the questionnaire from ${companyName}.
        You can view the proposal by clicking on the following link:
      </p>
      <p>
        <a href="${proposalUrl}" style="color: #0056b3; text-decoration: none; font-weight: bold;">
          View the commercial proposal
        </a>
      </p>
      <p>
        The ${companyName} team is at your disposal for any additional
        information requests.
      </p>
      <p>Best regards,<br />The ${companyName} team</p>
      <footer style="margin-top: 20px; color: #999;">
        <p>
          This is an automatically generated email. Please do not reply.
        </p>
      </footer>
    </div>
  `;
};
