import { useState, useEffect, useCallback, useRef } from 'react';
import { Profile } from '@/types/models';
import { fetchProfilesWithCountsOptimized, updateUserProfile } from '@/services/profileService';
import { UserWorkflowService } from '@/services/userWorkflowService';
import { toast } from 'react-toastify';
import { UserFormInputs } from '@/schemas/user';

const useProfiles = (companyId: string, search: string) => {
  const [profiles, setProfiles] = useState<Array<Profile & {folder_count: number}>>([]);
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
      // ✅ OPTIMIZED VERSION - Single method, 3 queries instead of N+1
      const profilesWithCounts = await fetchProfilesWithCountsOptimized(companyId, search);
      
      // ✅ Check if request wasn't cancelled
      if (!abortController.signal.aborted) {
        setProfiles(profilesWithCounts);
      }
    } catch (err) {
      // ✅ Ignore cancellation errors
      if (!abortController.signal.aborted) {
        setError('Error retrieving users.');
      }
    } finally {
      // ✅ Reset loading only if not cancelled
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [companyId, search]);
  
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

  const updateProfile = async (data: Profile, userId: string) => {
    try {
      await updateUserProfile(data, userId);
      toast.success(`${data.firstname} ${data.lastname} has been successfully updated in the list.`);
    } catch (err) {
      setError('Error updating the user.');
    }
  };

  const createNewUser = async (formInputs: UserFormInputs, companyId: string) => {
    try {
      // ✅ BUSINESS LOGIC EXTRACTED - Delegate to specialized service
      const result = await UserWorkflowService.createUserWithWorkflow(formInputs, companyId);
      
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
      setError('Error creating the user.');
    }
  };

  return { profiles, loading, error, updateProfile, createNewUser, fetchData };
};

export default useProfiles;
