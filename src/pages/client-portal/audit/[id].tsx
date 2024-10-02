import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";
import { getStepperSession } from '@/services/stepperService';
import { fetchCompanySettings } from '@/services/companySettingsService';
import { DbCompanySettings } from '@/types/dbTypes';
import { hasAccessToAudit } from '@/constants/permissions';
import ProgressBar from '@/components/common/ProgressBar';


const Audit: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<string>('not_started');
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [settings, setSettings] = useState<DbCompanySettings | null>(null);

  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const companyForSettings = await fetchTopMostParentCompanyCompanyById(id)
      if (companyForSettings) {
        const session = await getStepperSession(companyForSettings.id, id);
        if (session) {
          setWorkflowStatus(session.session.status);
          const settings = await fetchCompanySettings(companyForSettings.id);
          setSettings(settings);
          if (session.session.status === 'saved') {
            if (settings && settings.workflow) {
              const totalQuestions = settings.workflow.questions.length;
              const answeredQuestions = session.responses.length;
              const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
              setCompletionPercentage(percentage);
            }
          }
          if (session.session.status === 'completed') {
            setCompletionPercentage(100);
          }
        }
      }
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const getButtonText = () => {
    switch (workflowStatus) {
      case 'saved':
        return "Continuer l'audit";
      case 'completed':
        return "Voir les résultats";
      default:
        return "Démarrer l'audit";
    }
  };

  console.log(settings)

  return (
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <main className="w-4/5 p-12 overflow-y-auto flex flex-col">
          <div className="flex-grow">
            <div className="bg-white px-4 rounded-t-2xl flex justify-between min-h-36">
              <div className='flex flex-col justify-start mt-5'>
                <h4 className="text-black text-2xl font-semibold mb-2">Workflow</h4>
                <h6 className="text-gray-400 text-base font-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</h6>
              </div>
              {settings?.composition_workflow && <div className='flex flex-col justify-start mt-5'>
                {(
                  <h4 className="text-blueCustom text-2xl text-center font-semibold mb-5">{completionPercentage}%</h4>
                )}
                <Link 
                  href={`/client-portal/workflow/${id}`}
                  className="text-sm flex items-center justify-center text-white bg-blueCustom py-2 px-2 rounded-lg text-center"
                  rel="noopener noreferrer"
                >
                  {getButtonText()}
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>}
            </div>
            <ProgressBar percentage={completionPercentage} />
          </div>
        </main>
      </div>
  );
};

export default Audit;