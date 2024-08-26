import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompanyFormInputs, companySchema } from '@/schemas/company';
import axios from 'axios';
import dataApeCode from '../../data/codes-ape.json';
import { ROLES } from '@/constants/roles';
import { supabase } from '@/lib/supabaseClient';
import PrimaryContactSection from './section/PrimaryContactSection';
import CompanyMainInfoSection from './section/CompanyMainInfoSection';
import BaseModal from './BaseModal';
import { Button } from '../common/Button';

type AddCompanyModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
};

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onRequestClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CompanyFormInputs>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      role: ROLES.ADMIN,
    }
  });
  const [messageAlertSiren, setMessageAlertSiren] = useState('');
  const [messageAlertEmail, setMessageAlertEmail] = useState('');

  const onSubmitHandler = async (data: CompanyFormInputs) => {
    setIsLoading(true);
    const { data: companyData } = await supabase
      .from('company')
      .select('siren')
      .eq('siren', watch('siren'));

    if (companyData && companyData.length > 0) {
      setMessageAlertSiren('SIREN existe déjà');
      setIsLoading(false);
      return;
    }

    const { data: profileFata } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', watch('email'));

    if (profileFata && profileFata.length > 0) {
      setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
      setIsLoading(false);
      return;
    }
    await onSubmit(data);
    reset();
    setMessageAlertSiren('');
    setMessageAlertEmail('');
    setIsLoading(false);
    onRequestClose();
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      setMessageAlertSiren('');
      setMessageAlertEmail('');
    }
  }, [isOpen, reset]);

  const sirenValue = watch('siren');

  useEffect(() => {
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
        const company = responseSearch.data.results[0].siege
        setValue('address', `${company.numero_voie} ${company.type_voie} ${company.libelle_voie}`);
        setValue('city', company.libelle_commune);
        setValue('postalcode', company.code_postal);
        setValue('country', 'France');
        setMessageAlertSiren('');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (sirenValue && sirenValue.length === 9) {
      fetchCompanyDetails(sirenValue);
    } else {
      setMessageAlertSiren('');
      setValue('activity_sector', '');
      setValue('ape_code', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
    }
  }, [sirenValue, setValue]);

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Ajouter une entreprise">
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <CompanyMainInfoSection
          register={register}
          errors={errors}
          watch={watch}
          messageAlertSiren={messageAlertSiren}
        />
        <PrimaryContactSection<CompanyFormInputs>
          register={register}
          errors={errors}
          messageAlertEmail={messageAlertEmail}
        />
        <div className='flex justify-center'>
          <Button isLoading={isLoading} type="submit" className="bg-blueCustom text-white rounded px-4 py-2 mt-4">
            Créer cette entreprise
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddCompanyModal;
