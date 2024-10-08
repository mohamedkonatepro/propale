import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import dataApeCode from '../../data/codes-ape.json';
import { FolderFormInputs, folderSchema } from '@/schemas/folder';
import { RiDeleteBinLine } from "react-icons/ri";
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '../../constants/roles';
import FolderMainInfoSection from './section/FolderMainInfoSection';
import BaseModal from './BaseModal';
import { checkSiretAndCompanyId, fetchCompanyById } from '@/services/companyService';
import { Button } from '../common/Button';

type AddFolderModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: FolderFormInputs | null;
  role?: string;
  companyId: string;
};

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onRequestClose, onSubmit, defaultValues, role, companyId }) => {
  const [messageAlertSiret, setMessageAlertSiret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FolderFormInputs>({
    resolver: zodResolver(folderSchema),
    defaultValues: defaultValues || {}
  });

  const siretValue = watch('siret');

  useEffect(() => {
    const fetchCompanyDetails = async (siret: string) => {
      try {
        const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SIRENE_API_KEY}`, 
          },
        });
        const companyData = response.data.etablissement;
        const ape_code = companyData.uniteLegale.activitePrincipaleUniteLegale;
        setValue('ape_code', ape_code);
        const naf = dataApeCode.find(code => code.id === ape_code);
        if (naf) {
          setValue('activity_sector', naf?.label);
        }
        setValue('siren', companyData.siren);

        const adresseEtablissement = companyData.adresseEtablissement

        setValue('address', `${adresseEtablissement.numeroVoieEtablissement} ${adresseEtablissement.typeVoieEtablissement ?? ''} ${adresseEtablissement.libelleVoieEtablissement}`);
        setValue('city', adresseEtablissement.libelleCommuneEtablissement);
        setValue('postalcode', adresseEtablissement.codePostalEtablissement);
        setValue('country', 'France');
        if (!defaultValues?.id) {
          setValue('name', companyData.uniteLegale.denominationUniteLegale);
        }
        setMessageAlertSiret('');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (siretValue && siretValue.length === 14) {
      fetchCompanyDetails(siretValue);
    } else {
      setMessageAlertSiret('');
      setValue('activity_sector', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
      setValue('name', '');
    }
  }, [siretValue, setValue]);

  useEffect(() => {
    if (defaultValues) {
      for (const [key, value] of Object.entries(defaultValues)) {
        setValue(key as keyof FolderFormInputs, value);
      }
    }
  }, [defaultValues, setValue]);

  const onSubmitHandler = async (data: FolderFormInputs) => {
    setIsLoading(true);

    if (!defaultValues?.id) {
      const isValid = await checkSiretAndCompanyId(companyId, watch('siret'));

      if (!isValid) {
        setMessageAlertSiret('Le SIRET existe déjà');
        setIsLoading(false);
        return;
      }
    }
    await onSubmit(data);
    reset();
    setIsLoading(false);
  };

  const deleteFolder = async () => {
    await supabase.from('company').delete().eq('id', defaultValues?.id);
  }

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title={defaultValues ? 'Modifier le dossier' : 'Ajouter un dossier'}>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <FolderMainInfoSection
          register={register}
          errors={errors}
          watch={watch}
          messageAlertSiret={messageAlertSiret}
        />
        {role === (ROLES.ADMIN || ROLES.SUPER_ADMIN) && defaultValues && (
          <button onClick={deleteFolder} className='flex text-red-500'>
            <RiDeleteBinLine className='mt-1 mr-2' /> Supprimer ce dossier
          </button>
        )}
        <div className="flex justify-center">
          <Button isLoading={isLoading} type="submit" className="bg-blueCustom text-white rounded-xl px-4 py-2 mt-4">
            {defaultValues ? 'Modifier le dossier' : 'Créer le dossier'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddFolderModal;
