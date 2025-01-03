import React from 'react';
import Image from 'next/image';

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-[#FBFDFE] py-16" id="features">
      <div className="mx-auto px-4 sm:px-6 lg:px-20 text-center">
        {/* Heading and Subheading */}
        <h2 className="text-3xl font-medium text-gray-900 mb-4 text-center mx-auto w-full sm:w-3/4 lg:w-1/2">
          Convertissez plus <span className="text-blueCustom">rapidement</span> les prospects les plus <span className="text-blueCustom">pertinents</span>.
        </h2>
        <p className="text-gray-600 mb-12">
          Optimisez chaque étape pour mieux comprendre et cibler vos prospects. 
        </p>

        {/* Features Grid */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 px-6">
          {/* Feature 1 */}
          <div className="flex flex-col items-center p-0 w-full lg:w-5/12 bg-[#FBFDFE] border border-[#E2E8F0] rounded-2xl">
            <div className="flex flex-col items-start px-6 pt-6 w-full">
              <h3 className="text-sm font-medium text-[#364152]">
                Tunnel de vente paramétré
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2 w-full">
                Grâce à des questions paramétrées, vous identifiez les vrais besoins de vos clients et leur proposez des solutions sur-mesure.
              </p>
            </div>
            <div className="w-full h-[180px] sm:h-[245px] lg:h-[245px] relative">
              <Image src="/feature1.svg" alt="Feature Image" layout="fill" className="rounded-2xl" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center p-0 w-full lg:w-7/12 bg-[#FBFDFE] border border-[#E2E8F0] rounded-2xl">
            <div className="flex flex-col items-start px-6 pt-6 w-full">
              <h3 className="text-sm font-medium text-[#364152]">
                Propositions commerciales personnalisées
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2">
                Tunnel de vente qui connecte vos services aux besoins de vos prospects et génère des propositions commerciales
              </p>
            </div>
            <div className="w-full h-[180px] sm:h-[245px] lg:h-[260px] relative">
              <Image src="/feature2.svg" alt="Feature Image" layout="fill" className="rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 px-6 mt-8">
          {/* Feature 3 */}
          <div className="flex flex-col items-center p-0 w-full lg:w-7/12 bg-[#FBFDFE] border border-[#E2E8F0] rounded-2xl">
            <div className="flex flex-col items-start px-6 pt-6 w-full">
              <h3 className="text-sm font-medium text-[#364152]">
                Collaboratif pour optimiser le taux de conversion
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2">
                Maximisez la collaboration de vos clients, avec les options de partage de dossiers, de notes, de rappels et d’alertes.
              </p>
            </div>
            <div className="w-full h-[180px] sm:h-[245px] lg:h-[260px] relative">
              <Image src="/feature3.svg" alt="Feature Image" layout="fill" className="rounded-2xl" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center p-0 w-full lg:w-5/12 bg-[#FBFDFE] border border-[#E2E8F0] rounded-2xl">
            <div className="flex flex-col items-start px-6 pt-6 w-full">
              <h3 className="text-sm font-medium text-[#364152]">
                Planning et parcours de la relation client
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2">
                Un algorithme analyse les résultats du tunnel de vente et réalise la planification de vos prestations de service.
              </p>
            </div>
            <div className="w-full h-[180px] sm:h-[245px] lg:h-[245px] relative">
              <Image src="/feature4.svg" alt="Feature Image" layout="fill" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;