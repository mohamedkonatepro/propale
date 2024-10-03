import React from 'react';
import Image from 'next/image';

interface PartnerLogo {
  src: string;
  alt: string;
}

const partnerLogos: PartnerLogo[] = [
  { src: "/logo/Aura-colored.svg", alt: "Aura Logo" },
  { src: "/logo/Hudon-colored.svg", alt: "Hudon Logo" },
  { src: "/logo/Hues-Color.svg", alt: "Hues Logo" },
  { src: "/logo/Invert-Color.svg", alt: "Invert Logo" },
  { src: "/logo/luminous-Color.svg", alt: "Luminous Logo" },
  { src: "/logo/Orbitc-Color.svg", alt: "Orbitc Logo" },
];

const PartnerLogosSection: React.FC = () => {
  return (
    <section className="bg-backgroundGray py-4">
      <h2 className="text-lg text-gray-900 mb-8 text-center mx-auto w-full sm:w-3/4 lg:w-1/2">
        Ils nous font confiance :
      </h2>
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-12 justify-items-center">
          {partnerLogos.map((logo, index) => (
            <div key={index} className="flex justify-center items-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={60}
                className="mx-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogosSection;
