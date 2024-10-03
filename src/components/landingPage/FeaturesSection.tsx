import React from 'react';
import Image from 'next/image';

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-white py-16" id="features">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading and Subheading */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center mx-auto w-full sm:w-3/4 lg:w-1/2">
          Convertissez plus <span className="text-blueCustom">rapidement</span> les prospects les plus <span className="text-blueCustom">pertinents</span>.
        </h2>
        <p className="text-gray-600 mb-12">
          Nous vous fournissons tous les outils nécessaires pour réussir votre
          prospection en équipe.
        </p>

        {/* Features Grid */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 px-6">
          {/* Feature 1 */}
          <div className="flex flex-col items-center p-0 w-full lg:w-5/12 bg-[#FBFDFE] border border-[#E2E8F0] rounded-2xl">
            <div className="flex flex-col items-start px-6 pt-6 w-full">
              <h3 className="text-sm font-medium text-[#364152]">
                Ceci est une fonctionnalité exemple
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2 w-full">
                Ceci est une description de fonctionnalité lorem ipsum dolor sit
                amet, consectetur adipiscing elit, sed do eiusmod tempor.
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
                Ceci est une fonctionnalité exemple
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2">
                Ceci est une description de fonctionnalité lorem ipsum dolor sit
                amet, consectetur adipiscing elit, sed do eiusmod tempor.
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
                Ceci est une fonctionnalité exemple
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2">
                Ceci est une description de fonctionnalité lorem ipsum dolor sit
                amet, consectetur adipiscing elit, sed do eiusmod tempor.
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
                Ceci est une fonctionnalité exemple
              </h3>
              <p className="text-xs text-[#64748B] text-left mt-2">
                Ceci est une description de fonctionnalité lorem ipsum dolor sit
                amet, consectetur adipiscing elit, sed do eiusmod tempor.
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