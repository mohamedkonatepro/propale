import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import Link from "next/link";
import { IoEyeOutline } from 'react-icons/io5';
import { countAllProspectsByCompanyId, countCompaniesByParentId, fetchCompanyById } from '@/services/companyService';
import { toast } from 'react-toastify';
import { Switch } from '@/components/common/Switch';
import { TbSitemap } from "react-icons/tb";
import { MdFolderOpen } from "react-icons/md";
import { PiUsers } from "react-icons/pi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";
import { Company, CompanySettings, Workflow as WorkflowType } from '@/types/models';
import Workflow from '@/components/settings/Workflow';
import { createOrUpdateCompanySettings, fetchCompanySettings } from '@/services/companySettingsService';
import dynamic from 'next/dynamic';
import { countProfilesByCompanyId } from '@/services/profileService';
import { Button } from '@/components/common/Button';

const Select = dynamic(() => import('react-select'), { ssr: false });

const licenseOptions = [
  { value: 'individual', label: 'Individuel' },
  { value: 'enterprise', label: 'Entreprise' }
];

const Settings: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowType>({
    name: '',
    products: [],
    questions: []
  });
  const [userCount, setUserCount] = useState(0);
  const [folderCount, setFolderCount] = useState(0);
  const [prospectCount, setProspectCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const loadedCompany = await fetchCompanyById(id as string);
        if (loadedCompany) {
          setCompany(loadedCompany);
        }
        const loadedSettings = await fetchCompanySettings(id as string);
        if (loadedSettings) {
          setSettings(loadedSettings);
          setWorkflow(loadedSettings.workflow || { name: '', products: [], questions: [] });
        }
        setUserCount(await countProfilesByCompanyId(id as string));
        setFolderCount(await countCompaniesByParentId(id as string));
        setProspectCount(await countAllProspectsByCompanyId(id as string));
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value, 10);
    setSettings(prev => prev ? { ...prev, [name]: isNaN(numberValue) ? 0 : numberValue } : null);
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setSettings(prev => prev ? { ...prev, [name]: checked } : null);
  };

  const handleLicenseChange = (selectedOption: any) => {
    setSettings(prev => prev ? { ...prev, license_type: selectedOption.value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (settings) {
      const updatedSettings = await createOrUpdateCompanySettings({ ...settings, workflow });
      setIsLoading(false);
      if (updatedSettings) {
        toast.success("Paramètres enregistrés avec succès !");
      } else {
        toast.error("Erreur lors de l'enregistrement des paramètres.");
      }
    }
  };

  if (!company || !settings) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex-1 p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-6">
          <Header title={company.name} badgeName={settings.license_type} siren={company.siren} />
          <Link href={`/dashboard/folders/${id}`}>
            <button className="flex items-center bg-blueCustom text-white border border-2 border-blueCustom py-2 px-4 rounded-lg shadow-md">
              {"Ouvrir l'espace client"}
              <IoEyeOutline className="ml-2" />
            </button>
          </Link>
        </div>
        
        <div>
          <h3 className="text-base font-medium text-labelGray">{"Vue d'ensemble"}</h3>
          <div className="grid grid-cols-4 gap-10 mb-4 mt-2">
            <StatCard icon={<TbSitemap className='text-blueCustom' size="30" />} title="Workflows" total={settings.workflows_allowed.toString()} value="0" />
            <StatCard icon={<PiUsers className='text-blueCustom' size="30" />} title="Utilisateurs" total={settings.users_allowed.toString()} value={userCount.toString()} />
            <StatCard icon={<MdFolderOpen className='text-blueCustom' size="30" />} title="Dossiers" total={settings.folders_allowed.toString()} value={folderCount.toString()} />
            <StatCard icon={<HiOutlineBuildingOffice className='text-blueCustom' size="30" />} title="Prospects" value={prospectCount.toString()} />
          </div>

          <h3 className="text-base font-medium text-labelGray">Paramètres</h3>
          <div className="mt-2 bg-white p-7 rounded-3xl">
            <div className='flex w-full'>
              <div className='w-1/4'>
                <label className="block text-sm font-medium text-labelGray">Workflows autorisés</label>
                <input
                  name="workflows_allowed"
                  value={settings.workflows_allowed}
                  onChange={handleInputChange}
                  className="mt-1 block w-2/3 rounded p-2 bg-backgroundGray"
                  type="number"
                />
              </div>
              <div className='w-1/4'>
                <label className="block text-sm font-medium text-labelGray">Nb utilisateurs autorisés</label>
                <input
                  name="users_allowed"
                  value={settings.users_allowed}
                  onChange={handleInputChange}
                  className="mt-1 block w-2/3 rounded p-2 bg-backgroundGray"
                  type="number"
                />
              </div>
              <div className='flex flex-col justify-between w-4/12'>
                <div className="flex items-center justify-between">
                  <label className="ml-2 mr-5 block text-sm font-medium text-black">
                    Vision Canevas
                  </label>
                  <Switch checked={settings.vision_canevas} onCheckedChange={handleSwitchChange('vision_canevas')} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="ml-2 mr-5 block text-sm font-medium text-black">
                    Vision Audit
                  </label>
                  <Switch checked={settings.vision_audit} onCheckedChange={handleSwitchChange('vision_audit')} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="ml-2 mr-5 block text-sm font-medium text-black">
                    Composition workflow
                  </label>
                  <Switch checked={settings.composition_workflow} onCheckedChange={handleSwitchChange('composition_workflow')} />
                </div>
              </div>
            </div>
            <div className='flex w-full mt-5'>
              <div className='w-1/4'>
                <label className="block text-sm font-medium text-labelGray">Nb de contacts par prospect</label>
                <input
                  name="contacts_per_prospect"
                  value={settings.contacts_per_prospect}
                  onChange={handleInputChange}
                  className="mt-1 block w-2/3 rounded p-2 bg-backgroundGray"
                  type="number"
                />
              </div>
              <div className='w-1/4'>
                <label className="block text-sm font-medium text-labelGray">Nb de dossiers autorisés</label>
                <input
                  name="folders_allowed"
                  value={settings.folders_allowed}
                  onChange={handleInputChange}
                  className="mt-1 block w-2/3 rounded p-2 bg-backgroundGray"
                  type="number"
                />
              </div>
              <div className='w-1/4'>
                <label className="block text-sm font-medium text-labelGray">Licence</label>
                <Select
                  options={licenseOptions}
                  value={licenseOptions.find(option => option.value === settings.license_type)}
                  onChange={handleLicenseChange}
                  className="bg-backgroundGray"
                />
              </div>
            </div>

            <div className='flex w-full mt-5'>
              <div className='w-5/12'>
                <div className="flex items-center justify-between">
                  <label className="ml-2 mr-5 block text-sm font-medium text-black">
                    Désactiver le compte client
                  </label>
                  <Switch checked={settings.is_account_disabled} onCheckedChange={handleSwitchChange('is_account_disabled')} />
                </div>
              </div>
            </div>

            <div className='flex w-full mt-5'>
              <div className='w-5/12'>
                <div className="flex items-center justify-between">
                  <label className="ml-2 mr-5 block text-sm font-medium text-red-500 cursor-pointer" onClick={() => console.log('delete WIP')}>
                    Supprimer le compte client
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-base font-medium text-labelGray mt-6">Workflow</h3>
        <Workflow 
          workflow={workflow}
          updateWorkflow={(updatedWorkflow) => setWorkflow(updatedWorkflow)}
        />

        <div className='flex justify-center mt-5'>
          <Button type="submit" disabled={isLoading} isLoading={isLoading} className="bg-blueCustom text-white rounded px-4 py-2">
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const company = await fetchCompanyById(id);
  
  if (!company) {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; total?: string }> = ({ icon, title, value, total }) => (
  <div className="bg-white p-4 rounded-3xl flex justify-around items-center">
    <div className="text-2xl mr-3 bg-blue-200 rounded-full p-5">{icon}</div>
    <div>
      <div className="text-2xl font-bold text-blueCustom">
        {value}{total && <span className="text-labelGray font-normal">/{total}</span>}
      </div>
      <div className="text-sm text-blueCustom">{title}</div>
    </div>
  </div>
);

export default Settings;