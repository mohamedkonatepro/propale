import React from 'react';
import Image from 'next/image';

const DashboardOverview: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading and Subheading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center mx-auto w-full sm:w-3/4 lg:w-1/2">
          La meilleure solution pour <span className="text-blueCustom">prospecter</span>, <span className="text-blueCustom">auditer</span> et <span className="text-blueCustom">gérer</span> tous vos futurs clients, dans un seul outil.
        </h2>
        <p className="text-gray-600 mb-12 text-center mx-auto w-full sm:w-2/3 lg:w-1/3">
        Faites monter en gamme votre processus de ventes en synchronisant vos vitrines digitales à un annuaire de prospection dynamique.
        </p>

        {/* Dashboard Image with Overlays */}
        <div className="relative flex justify-center">
          {/* Main Dashboard Image */}
          <div className="relative">
            <Image
              src="/sales_dashboard.svg"
              alt="Sales Dashboard"
              width={600}
              height={400}
              className="mx-auto w-full sm:w-[80%] lg:w-[600px]"
            />
            {/* Contact Popup Overlay */}
            <Image
              src="/contact_popup.svg"
              alt="Contact Popup"
              width={250}
              height={180}
              className="absolute top-[-30px] right-[-30px] sm:top-[-40px] sm:right-[-50px] lg:top-[-70px] lg:right-[-160px]"
            />
            {/* Prospect Popup Overlay */}
            <Image
              src="/prospect_popup.svg"
              alt="Prospect Popup"
              width={250}
              height={180}
              className="absolute bottom-[-30px] left-[-30px] sm:bottom-[-40px] sm:left-[-50px] lg:bottom-[-70px] lg:left-[-170px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardOverview;