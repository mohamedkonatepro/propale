import { FaFacebook, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

const SocialMediaIcons = () => {
  return (
    <div className="mt-4 flex justify-center space-x-4">
      <a href="#" className="text-gray-500 hover:text-blue-600">
        <FaFacebook size={24} />
      </a>
      <a href="#" className="text-gray-500 hover:text-green-600">
        <FaWhatsapp size={24} />
      </a>
      <a href="#" className="text-gray-500 hover:text-blue-400">
        <RiTwitterXFill size={24} />
      </a>
      <a href="#" className="text-gray-500 hover:text-blue-700">
        <FaLinkedinIn size={24} />
      </a>
    </div>
  );
};

export default SocialMediaIcons;
