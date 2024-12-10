import Image from 'next/image';
import SocialMediaIcons from '../common/SocialMediaIcons';

const Footer = () => {
  return (
    <footer className="w-full bg-blue-50 py-6">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo et nom de l'entreprise */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Image src="/logo.svg" alt="Logo Propale" width={40} height={40} />
            <span className="text-lg font-medium text-gray-800">Propale</span>
          </div>

          {/* Liens légaux au centre */}
          <div className="flex flex-col md:flex-row text-center mb-4 md:mb-0">
            <a href="#mentions" className="text-blueCustom hover:text-blue-700 mx-2">Mentions légales</a>
            <a href="#conditions" className="text-blueCustom hover:text-blue-700 mx-2">Conditions générales de vente</a>
            <a href="#privacy" className="text-blueCustom hover:text-blue-700 mx-2">Politique de confidentialité</a>
          </div>

          {/* Réseaux sociaux à droite */}
          <div className="text-center">
            <SocialMediaIcons />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">© 2024 Katech. Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
