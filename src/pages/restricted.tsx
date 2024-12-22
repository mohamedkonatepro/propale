import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

const RestrictedAccessPage = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-medium text-blueCustom mb-2">Accès Restreint</h1>
        <p className="text-gray-600 mb-6">
          {"Les accès à votre compte sont actuellement restreints. Veuillez contacter l'administrateur pour plus d'informations."}
        </p>
        <Button onClick={handleRedirect} className="w-full bg-blueCustom hover:bg-blue-700">
          {"Retour à la page d'accueil"}
        </Button>
      </div>
    </div>
  );
};

export default RestrictedAccessPage;