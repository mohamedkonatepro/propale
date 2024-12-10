import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types/models';
import { createProspect, deleteProspect, fetchProspects, updateCompany } from '@/services/companyService';
import { CompanyFormInputs } from '@/schemas/company';

const useProspects = (
  companyId?: string,
  search: string = "",
  initialPage: number = 1,
  pageSize: number = 10
) => {
  const [prospects, setProspects] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      if (companyId) {
        const response = await fetchProspects(companyId, search, currentPage, pageSize);
        setProspects(response.data);
        setTotalPages(Math.ceil(response.count / pageSize));
      }
    } catch (err) {
      console.error('Error fetching prospects:', err);
      setError('Erreur lors de la récupération des prospects.');
    } finally {
      setLoading(false);
    }
  }, [companyId, search, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, []);

  const addProspect = async (prospect: CompanyFormInputs) => {
    try {
      const newProspect = await createProspect(prospect);
      if (newProspect) {
        setProspects((prev) => [newProspect, ...prev]);
      }
    } catch (err) {
      console.error('Error creating prospect:', err);
      setError('Erreur lors de la création du prospect.');
    }
  };

  const editProspect = async (prospect: Company) => {
    try {
      await updateCompany(prospect);
      setProspects((prev) =>
        prev.map((p) => (p.id === prospect.id ? { ...p, ...prospect } : p))
      );
    } catch (err) {
      console.error('Error updating prospect:', err);
      setError('Erreur lors de la modification du prospect.');
    }
  };

  const removeProspect = async (prospectId: string) => {
    try {
      await deleteProspect(prospectId);
      setProspects((prev) => prev.filter((p) => p.id !== prospectId));
    } catch (err) {
      console.error('Error deleting prospect:', err);
      setError('Erreur lors de la suppression du prospect.');
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    prospects,
    loading,
    error,
    totalPages,
    currentPage,
    addProspect,
    editProspect,
    removeProspect,
    setPage: goToPage,
    fetchData,
  };
};

export default useProspects;
