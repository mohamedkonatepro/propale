import React from "react";

const ProposalPage = () => {
  const needs = [1, 2, 3, 4];
  const paragraphs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // Array of items representing paragraphs

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg print:shadow-none print:border-none" id="proposal-content">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Proposition commerciale</h1>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Destinée à</p>
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-bold text-lg">Raison Sociale</p>
                  <p className="text-sm text-gray-500">SIRET : 983 067 737</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mt-2">Le 23/04/2024</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600">Description</h2>
          <p className="text-gray-600 mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Needs Section */}
        {needs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600">Besoins</h2>
            {needs.map((item, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Titre du besoin</h3>
                <p className="text-gray-600">200000€</p>
                <p className="text-gray-500 mt-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Total Section */}
        <div className="flex justify-between items-center mt-8 border-t pt-4">
          <p className="text-gray-600 font-semibold">Total :</p>
          <p className="text-gray-800 font-bold text-lg">2000000€ HT</p>
        </div>


        {/* Additional Content */}
        {paragraphs.length > 0 && (
          <div className="mt-10">
            {paragraphs.map((item, index) => (
              <div key={index} className="mb-4 print:break-inside-avoid">
                <h3 className="text-lg font-semibold text-gray-800">Paragraphe</h3>
                <p className="text-gray-500 mt-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Spacer to push footer down */}
        <div className="flex-grow print:break-inside-avoid"></div>

        {/* Footer Section */}
        <div className="break-before-all mt-20 text-center text-gray-500 text-sm print:absolute print:bottom-0 print:left-0 print:right-0 print:mt-0">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="mt-4">
            Réalisé avec <span className="font-semibold text-blue-600">Propale</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;