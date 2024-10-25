import React from 'react';
import { useRouter } from 'next/router';
import { AiOutlineWarning } from 'react-icons/ai';

const CompanyNotFound: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <AiOutlineWarning className="text-red-500 text-5xl mb-4" />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Entreprise non trouvée</h1>
        <p className="text-gray-600 mb-6">
          Il semble que l’entreprise que vous recherchez n’existe pas dans notre base de données.
        </p>
        <button
          onClick={handleGoBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Retour
        </button>
      </div>
    </div>
  );
};

export default CompanyNotFound;
