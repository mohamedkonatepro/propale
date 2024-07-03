import Image from 'next/image';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import React from 'react';

const SocialLinks = () => {
  return (
    <div className="text-center mt-24">
      <p className="mt-4 text-gray-500 text-sm">Suivez Katech sur les réseaux</p>
      <div className="mt-4 flex justify-center space-x-4">
        <a href="#" className="text-gray-500">
          <FaFacebook size={24} />
        </a>
        <a href="#" className="text-gray-500">
          <FaWhatsapp size={24} />
        </a>
        <a href="#" className="text-gray-500">
          <Image src="/x-logo.png" alt="x" width={24} height={24} />
        </a>
        <a href="#" className="text-gray-500">
          <Image src="/linkedin-logo.png" alt="linkedin" width={24} height={24} />
        </a>
      </div>
    </div>
  );
};

export default SocialLinks;
