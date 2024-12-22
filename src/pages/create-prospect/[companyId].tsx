import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyDetailsSchema, companyDetailsInputs } from '@/schemas/company';
import axios from 'axios';
import dataApeCode from '../../data/codes-ape.json';
import { Company } from '@/types/models';
import { CiFolderOn } from "react-icons/ci";
import { heatLevels, statuses } from '@/constants';
import MainInfoSection from '@/components/modals/section/MainInfoSection';
import { Button } from '@/components/common/Button';
import PasswordSection from '@/components/section/PasswordSection';
import PrimaryContactSection from '@/components/modals/section/PrimaryContactSection';
import { useRouter } from 'next/router';
import { checkSirenAndCompanyId, createProspect, fetchCompanyById } from '@/services/companyService';
import { supabase } from '@/lib/supabaseClient';
import CompanyNotFound from '@/components/common/CompanyNotFound';

const AddProspectPage: React.FC = () => {
  const router = useRouter();
  const companyId = Array.isArray(router.query.companyId) ? router.query.companyId[0] : router.query.companyId;

  const [company, setCompany] = useState<Company | null>(null); 
  const [isCompanyLoading, setIsCompanyLoading] = useState(true); // Nouvel état pour le chargement de l'entreprise
  const [isLoading, setIsLoading] = useState(false);
  const [messageAlertEmail, setMessageAlertEmail] = useState('');
  const [messageAlertSiren, setMessageAlertSiren] = useState('');
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<companyDetailsInputs>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      name: '',
      siren: '',
      ape_code: '',
      activity_sector: '',
      firstname: '',
      lastname: '',
      position: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [status, setStatus] = useState(statuses[0].value);
  const [heatLevel, setHeatLevel] = useState(heatLevels[0].value);
  const sirenValue = watch('siren');

  useEffect(() => {
    const getCompany = async () => {
      setIsCompanyLoading(true); // Démarrer le chargement
      try {
        const result = await fetchCompanyById(companyId as string);
        setCompany(result);
      } catch (error) {
        console.error('Erreur lors de la récupération de l’entreprise :', error);
        setCompany(null); // Définir company à null en cas d'erreur
      } finally {
        setIsCompanyLoading(false); // Terminer le chargement
      }
    };
  
    if (companyId) {
      getCompany();
    }
  }, [companyId]);
  
  
  const fetchCompanyDetails = async (siren: string) => {
    try {
      const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siren/${siren}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SIRENE_API_KEY}`,
        },
      });
      const companyData = response.data.uniteLegale;
      const ape_code = companyData.periodesUniteLegale[0].activitePrincipaleUniteLegale;
      setValue('ape_code', ape_code);
      const naf = dataApeCode.find(code => code.id === ape_code);
      if (naf) {
        setValue('activity_sector', naf?.label);
      }

      const responseSearch = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}`);
      const companySearch = responseSearch.data.results[0].siege;
      setValue('address', `${companySearch.numero_voie} ${companySearch.type_voie} ${companySearch.libelle_voie}`);
      setValue('city', companySearch.libelle_commune);
      setValue('postalcode', companySearch.code_postal);
      setValue('name', companySearch.nom_commercial);
      setValue('country', 'France');
      setMessageAlertSiren('');
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
    }
  };

  const onSubmitHandler = async (data: companyDetailsInputs) => {
    setIsLoading(true);
    const emailValue = watch('email');
    
    const isValid = await checkSirenAndCompanyId(companyId as string, watch('siren'));
  
    if (!isValid) {
      setMessageAlertSiren('SIREN existe déjà');
      setIsLoading(false);
      return;
    }
  
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', emailValue);
  
    if (profileData && profileData.length > 0) {
      setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
      setIsLoading(false);
      return;
    }
  
    const prospect = await createProspect({ ...data, status, heat_level: heatLevel, companyId });
    setIsLoading(false);
    reset();
    if (prospect) {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password || '' });
      router.push(`/client-portal/workflow/${prospect.id}?origin=ext`);
    }
  };
  

  useEffect(() => {
    if (sirenValue && sirenValue.length === 9) {
      fetchCompanyDetails(sirenValue);
    } else {
      setValue('activity_sector', '');
      setValue('ape_code', '');
    }
  }, [sirenValue, setValue]);

  if (isCompanyLoading) {
    return <div>Loading...</div>;
  }

  if (!isCompanyLoading && !company) {
    return <CompanyNotFound />;
  }
  
  return (
    <div className="mx-auto px-4 w-[850px] bg-white py-5">
      <h1 className="text-2xl font-medium text-center mb-6">Ajouter un prospect</h1>
      <div className="flex flex-col justify-center items-center border-b pb-2 mb-4">
        {company && <div className='flex items-center justify-center text-labelGray mt-3'><CiFolderOn /> <p className='ml-2'>{company.name}</p></div>}
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <MainInfoSection 
          register={register} 
          errors={errors} 
          watch={watch} 
          status={status} 
          heatLevel={heatLevel} 
          setStatus={setStatus} 
          setHeatLevel={setHeatLevel} 
          messageAlertSiren={messageAlertSiren}
          disableStatusAndHeat={true}
        />
        <PrimaryContactSection register={register} errors={errors} messageAlertEmail={messageAlertEmail} />
        <PasswordSection register={register} errors={errors} />
        <div className='flex justify-center'>
          <Button isLoading={isLoading} type="submit" className="bg-blueCustom text-white rounded px-4 py-2 mt-4">
            Créer le prospect
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProspectPage;
