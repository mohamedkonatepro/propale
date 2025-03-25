import { useState, useEffect, useCallback, useRef } from 'react';
import { Company } from '@/types/models';
import { fetchCompanyById, updateCompany } from '@/services/companyService';
import { CompanyWorkflowService } from '@/services/companyWorkflowService';
import { toast } from 'react-toastify';

const useCompanyData = (companyId: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Référence vers le contrôleur d'abort actuel
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // ✅ Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // ✅ Créer un nouveau contrôleur pour cette requête
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      const companyData = await fetchCompanyById(companyId);
      
      // ✅ Vérifier si la requête n'a pas été annulée
      if (!abortController.signal.aborted) {
        setCompany(companyData);
      }
    } catch (err) {
      // ✅ Ignorer les erreurs d'annulation
      if (!abortController.signal.aborted) {
        setError('Erreur lors de la récupération de l\'entreprise.');
      }
    } finally {
      // ✅ Réinitialiser le loading seulement si ce n'est pas annulé
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Cleanup: Annuler les requêtes en cours au unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
      // ✅ LOGIQUE MÉTIER EXTRAITE - Délégation au service spécialisé
      const result = await CompanyWorkflowService.createCompanyWithWorkflow(data);
      
      if (result.success) {
        toast.success(result.message);
        // Recharger les données après création réussie
        fetchData();
      } else {
        toast.error(result.message);
        setError(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur inattendue est survenue";
      
      toast.error(errorMessage);
      setError('Erreur lors de la création de l\'entreprise.');
    }
  };

  const createNewProspect = async (data: any) => {
    try {
      // ✅ LOGIQUE MÉTIER EXTRAITE - Délégation au service spécialisé
      const result = await CompanyWorkflowService.createProspectWithWorkflow(data);
      
      if (result.success) {
        toast.success(result.message);
        // Recharger les données après création réussie
        fetchData();
      } else {
        toast.error(result.message);
        setError(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur inattendue est survenue";
      
      toast.error(errorMessage);
      setError('Erreur lors de la création du prospect.');
    }
  };

  return { company, loading, error, updateCompanyData, createNewCompany, createNewProspect, fetchData };
};

export default useCompanyData;
