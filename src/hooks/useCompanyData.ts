import { useState, useEffect, useCallback, useRef } from 'react';
import { Company } from '@/types/models';
import { fetchCompanyById, updateCompany } from '@/services/companyService';
import { CompanyWorkflowService } from '@/services/companyWorkflowService';
import { toast } from 'react-toastify';

const useCompanyData = (companyId: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Reference to current abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // ✅ Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // ✅ Create new controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      const companyData = await fetchCompanyById(companyId);
      
      // ✅ Check if request wasn't cancelled
      if (!abortController.signal.aborted) {
        setCompany(companyData);
      }
    } catch (err) {
      // ✅ Ignore cancellation errors
      if (!abortController.signal.aborted) {
        setError('Error retrieving the company.');
      }
    } finally {
      // ✅ Reset loading only if not cancelled
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Cleanup: Cancel ongoing requests on unmount
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
      toast.success(`${data.name} has been successfully updated.`);
    } catch (err) {
      setError('Error updating the company.');
    }
  };

  const createNewCompany = async (data: any) => {
    try {
      // ✅ BUSINESS LOGIC EXTRACTED - Delegation to specialized service
      const result = await CompanyWorkflowService.createCompanyWithWorkflow(data);
      
      if (result.success) {
        toast.success(result.message);
        // Reload data after successful creation
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
      setError('Error creating the company.');
    }
  };

  const createNewProspect = async (data: any) => {
    try {
      // ✅ BUSINESS LOGIC EXTRACTED - Delegation to specialized service
      const result = await CompanyWorkflowService.createProspectWithWorkflow(data);
      
      if (result.success) {
        toast.success(result.message);
        // Reload data after successful creation
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
      setError('Error creating the prospect.');
    }
  };

  return { company, loading, error, updateCompanyData, createNewCompany, createNewProspect, fetchData };
};

export default useCompanyData;
