import React from 'react';
import Image from 'next/image';

const CTASection: React.FC = () => {
  return (
    <section className="bg-[#FBFDFE] pt-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="lg:flex lg:items-center">
          {/* Partie gauche : Texte et bouton */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-4">
              <span className="text-blueCustom">Propale</span>: l’outil essentiel pour booster votre business
            </h2>
            <p className="text-gray-600 mb-6">
              Plus qu’un CRM, c’est un tunnel de vente intelligent qui transforme votre façon de vendre
            </p>
            <p className="text-gray-600 mt-6 pb-6">
              Gagner du temps grâce à un parcours de ventre rapide, simple et fluide qui augmente votre connaissance de vos prospects et améliore votre taux de conversion
              Maximiser vos ventes avec des propositions précises de services, tarifs et services additionnels adaptés aux besoins de chaque prospect
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
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[570px] mt-6">
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