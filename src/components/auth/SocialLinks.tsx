import Image from 'next/image';
import { FaFacebook, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
import { RiTwitterXFill } from "react-icons/ri";

import React from 'react';

const SocialLinks = () => {
  return (
    <div className="text-center mt-20">
      <p className="mt-4 text-gray-500 text-sm">Suivez Katech sur les réseaux</p>
      <div className="mt-4 flex justify-center space-x-4">
        <a href="#" className="text-gray-500">
          <FaFacebook size={24} />
        </a>
        <a href="#" className="text-gray-500">
          <FaWhatsapp size={24} />
        </a>
        <a href="#" className="text-gray-500">
          <RiTwitterXFill size={24} />
        </a>
        <a href="#" className="text-gray-500">
          <FaLinkedinIn size={24} />
        </a>
      </div>
    </div>
  );
};

export default SocialLinks;
