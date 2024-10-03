import React from 'react';
import Image from 'next/image';

const CTASection: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center">
          {/* Partie gauche : Texte et bouton */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Promesse percutante simple et <span className="text-blueCustom">concise</span>.
            </h2>
            <p className="text-gray-600 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ipsum dolor sit amet.
            </p>
            <a
              href="#contact"
              className="px-4 py-4 bg-blueCustom text-white rounded-md text-sm font-medium hover:bg-blue-700 border border-blueCustom"
            >
              Demander une démo
            </a>
          </div>

          {/* Partie droite : SVG agrandi et collé à droite */}
          <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-[500px]">
              <Image
                src="/frame_263.svg"
                alt="Illustration"
                layout="fill"
                objectFit="contain"
                className="absolute right-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;