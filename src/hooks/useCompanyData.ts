import { useState, useEffect } from 'react';
import { Company } from '@/types/models';
import { fetchCompanyById, updateCompany, createCompany, createProspect, countCompaniesByParentId } from '@/services/companyService';
import { toast } from 'react-toastify';
import { fetchCompanySettings } from '@/services/companySettingsService';

const useCompanyData = (companyId: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const companyData = await fetchCompanyById(companyId);
      setCompany(companyData);
    } catch (err) {
      setError('Erreur lors de la récupération de l\'entreprise.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const updateCompanyData = async (data: any) => {
    try {
      await updateCompany(data);
      toast.success(`${data.name} à bien été modifié.`);
    } catch (err) {
      setError('Erreur lors de la modification de l\'entreprise.');
    }
  };

  const createNewCompany = async (data: any) => {
    try {
      const currentFolderCount = await countCompaniesByParentId(data.companyId);
      const settings = await fetchCompanySettings(data.companyId);
    
      if (!settings) {
        throw new Error("Impossible de récupérer les paramètres de l'entreprise parente");
      }
    
      if (currentFolderCount >= settings.folders_allowed) {
        throw new Error("Le nombre maximum de dossiers autorisés a été atteint");
      }
      await createCompany(data);
      toast.success(`${data.name} à bien été ajouté à la liste.`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue lors de la création du dossier");
      }
      setError('Erreur lors de la création de l\'entreprise.');
    }
  };

  const createNewProspect = async (data: any) => {
    try {
      const result = await createProspect(data);
      if (typeof result === 'string') {
        setError(result);
      } else if (!result) {
        toast.error('Une erreur est survenue lors de la création du prospect.');
      } else {
        toast.success('Le prospect a été créé avec succès.');
      }
    } catch (err) {
      setError('Erreur lors de la création du prospect.');
    }
  };

  return { company, loading, error, updateCompanyData, createNewCompany, createNewProspect, fetchData };
};

export default useCompanyData;
