import { useState, useEffect } from 'react';
import { Company, CompanyModalData } from '@/types/models';
import { createProspect, deleteProspect, fetchProspects, updateCompany } from '@/services/companyService';

const useProspects = (companyId: string, search: string) => {
  const [prospects, setProspects] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchProspects(companyId, search);
      setProspects(data);
    } catch (err) {
      setError('Erreur lors de la récupération des prospects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, search]);

  const addProspect = async (prospect: CompanyModalData) => {
    try {
      const newProspect = await createProspect(prospect);
      if (newProspect) {
        setProspects([...prospects, newProspect]);
      }
    } catch (err) {
      setError('Erreur lors de la création du prospect.');
    }
  };

  const editProspect = async (prospect: Company) => {
    try {
      await updateCompany(prospect);
    } catch (err) {
      setError('Erreur lors de la modification du prospect.');
    }
  };
  

  const removeProspect = async (prospectId: string) => {
    try {
      await deleteProspect(prospectId);
      setProspects(prospects.filter(p => p.id !== prospectId));
    } catch (err) {
      setError('Erreur lors de la suppression du prospect.');
    }
  };

  return { prospects, loading, error, addProspect, removeProspect, fetchData, editProspect };
};

export default useProspects;
