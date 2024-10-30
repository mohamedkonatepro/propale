export const generateProposalEmailContent = (
  proposalUrl: string,
  companyName: string,
  firstName: string,
  lastName: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Bonjour ${firstName} ${lastName},</p>
      <p>
        Nous vous remercions d’avoir complété le questionnaire de ${companyName}.
        Vous pouvez consulter la proposition en cliquant sur le lien suivant :
      </p>
      <p>
        <a href="${proposalUrl}" style="color: #0056b3; text-decoration: none; font-weight: bold;">
          Voir la proposition commerciale
        </a>
      </p>
      <p>
        L’équipe ${companyName} se tient à votre disposition pour toute demande
        d’informations complémentaires.
      </p>
      <p>Cordialement,<br />L’équipe ${companyName}</p>
      <footer style="margin-top: 20px; color: #999;">
        <p>
          Ceci est un email généré automatiquement. Veuillez ne pas y répondre.
        </p>
      </footer>
    </div>
  `;
};
