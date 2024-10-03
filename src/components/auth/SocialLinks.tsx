import Image from 'next/image';
import { FaFacebook, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
import { RiTwitterXFill } from "react-icons/ri";

import React from 'react';
import SocialMediaIcons from '../common/SocialMediaIcons';

const SocialLinks = () => {
  return (
    <div className="text-center mt-20">
      <p className="mt-4 text-gray-500 text-sm">Suivez Katech sur les réseaux</p>
      <SocialMediaIcons />
    </div>
  );
};

export default SocialLinks;
