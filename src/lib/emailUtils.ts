export const generateProposalEmailContent = (proposalUrl: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0056b3;">Nouvelle Proposition Commerciale</h2>
      <p>Bonjour,</p>
      <p>
        Vous avez une nouvelle proposition commerciale. Vous pouvez y accéder en cliquant
        sur le lien suivant :
      </p>
      <p>
        <a href="${proposalUrl}" style="color: #0056b3; text-decoration: none; font-weight: bold;">
          Voir la proposition commerciale
        </a>
      </p>
      <p>
        Cordialement,<br />
        Votre équipe commerciale
      </p>
      <footer style="margin-top: 20px; color: #999;">
        <p>
          Ceci est un email généré automatiquement. Veuillez ne pas y répondre.
        </p>
      </footer>
    </div>
  `;
};
