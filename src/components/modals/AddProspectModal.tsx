import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema } from '@/schemas/company';
import axios from 'axios';
import { ROLES } from '@/constants/roles';
import dataApeCode from '../../data/codes-ape.json';
import { Company } from '@/types/models';
import { CiFolderOn } from "react-icons/ci";
import { heatLevels, statuses } from '@/constants';
import { prospectSchema } from '@/schemas/prospect';
import { supabase } from '@/lib/supabaseClient';
import MainInfoSection from './section/MainInfoSection';
import PrimaryContactSection from './section/PrimaryContactSection';
import AdditionalContactsSection from './section/AdditionalContactsSection';
import BaseModal from './BaseModal';
import { z } from 'zod';

type AddProspectModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  company: Company;
  defaultValues?: Company;
};

export type FormInputs = z.infer<typeof companySchema> & {
  additionalContacts: {
    firstname: string;
    lastname: string;
    position?: string;
    role?: string;
    email: string;
    phone?: string;
  }[];
};

const customStyles = {
  top: '50%',
  left: '50%',
  right: 'auto',
  bottom: 'auto',
  marginRight: '-50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
};

const AddProspectModal: React.FC<AddProspectModalProps> = ({ isOpen, onRequestClose, onSubmit, company, defaultValues }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<FormInputs>({
    resolver: zodResolver(defaultValues?.id ? prospectSchema : companySchema.extend({
      additionalContacts: z.array(z.object({
        firstname: z.string().min(1, "Prénom est requis"),
        lastname: z.string().min(1, "Nom est requis"),
        position: z.string().optional(),
        role: z.string().default(ROLES.PROSPECT),
        email: z.string().email("Email invalide").min(1, "Email est requis"),
        phone: z.string().optional(),
      })).default([])
    })),
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
      address: '',
      postalcode: '',
      city: '',
      country: '',
      role: ROLES.PROSPECT,
      additionalContacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalContacts',
  });

  const [status, setStatus] = useState(statuses[0].value);
  const [heatLevel, setHeatLevel] = useState(heatLevels[0].value);
  const [messageAlertSiren, setMessageAlertSiren] = useState('');
  const [messageAlertEmail, setMessageAlertEmail] = useState('');
  const [messageAlertAdditionalEmails, setMessageAlertAdditionalEmails] = useState('');
  const sirenValue = watch('siren');
  const emailValue = watch('email');
  const additionalContacts = watch('additionalContacts');

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
      setValue('country', 'France');
      setMessageAlertSiren('');
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
    }
  };

  const onSubmitHandler = async (data: FormInputs) => {
    if (!defaultValues?.id) {
      const { data: companyData } = await supabase
        .from('company')
        .select('siren')
        .eq('siren', sirenValue);

      if (companyData && companyData.length > 0) {
        setMessageAlertSiren('SIREN existe déjà');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', emailValue);

      if (profileData && profileData.length > 0) {
        setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
        return;
      }

      // Vérification des emails des contacts supplémentaires
      const additionalContactEmails = additionalContacts.map(contact => contact.email);
      const uniqueAdditionalContactEmails = new Set(additionalContactEmails);

      if (uniqueAdditionalContactEmails.size !== additionalContactEmails.length) {
        setMessageAlertAdditionalEmails('Des emails en double existent parmi les contacts supplémentaires.');
        return;
      }

      const { data: additionalProfileData } = await supabase
        .from('profiles')
        .select('email')
        .in('email', additionalContactEmails);

      if (additionalProfileData && additionalProfileData.length > 0) {
        setMessageAlertAdditionalEmails('Certains contacts supplémentaires ont déjà des comptes utilisateurs.');
        return;
      }
    }
    
    await onSubmit({ ...data, status, heatLevel, companyId: company.id });
    setStatus(statuses[0].value);
    setHeatLevel(heatLevels[0].value);
    reset();
    setMessageAlertAdditionalEmails('');
    setMessageAlertEmail('');
    setMessageAlertSiren('');
  };

  useEffect(() => {
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

  useEffect(() => {
    setMessageAlertEmail('');
  }, [emailValue]);

  useEffect(() => {
    if (defaultValues?.id) {
      setValue('name', defaultValues.name);
      setValue('siren', defaultValues.siren || '');
      setValue('ape_code', defaultValues.ape_code || '');
      setValue('activity_sector', defaultValues.activity_sector || '');
      setValue('address', defaultValues.address || '');
      setValue('city', defaultValues.city || '');
      setValue('postalcode', defaultValues.postalcode || '');
      setValue('country', defaultValues.country || '');
      setStatus(defaultValues.status || '');
      setHeatLevel(defaultValues.heat_level || '');
    } else {
      setValue('name', '');
      setValue('siren', '');
      setValue('ape_code', '');
      setValue('activity_sector', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
      setValue('country', '');
      setStatus(statuses[0].value);
      setHeatLevel(heatLevels[0].value);
    }
  }, [defaultValues, setValue]);

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title={defaultValues?.id ? 'Modifier un prospect' : 'Ajouter un prospect'} customStyleOverrides={customStyles}>
      <div className="flex flex-col justify-center items-center border-b pb-2 mb-4">
        <div className='flex items-center justify-center text-labelGray mt-3'><CiFolderOn /> <p className='ml-2'>{company.name}</p></div>
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
        />
        {!defaultValues?.id && (
          <PrimaryContactSection<FormInputs>
            register={register}
            errors={errors}
            messageAlertEmail={messageAlertEmail}
          />
        )}
        <AdditionalContactsSection
          fields={fields}
          register={register}
          errors={errors}
          append={append}
          remove={remove}
          messageAlertAdditionalEmails={messageAlertAdditionalEmails}
        />
        <div className='flex justify-center'>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-4">
            {defaultValues?.id ? 'Modifier' : 'Créer'} le prospect
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddProspectModal;