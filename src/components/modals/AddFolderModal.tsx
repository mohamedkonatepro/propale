import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import dataApeCode from '../../data/codes-ape.json';
import { FolderFormInputs, folderSchema } from '@/schemas/folder';
import { RiDeleteBinLine } from "react-icons/ri";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';
import CustomAlert from '../common/Alert';

type AddFolderModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: FolderFormInputs | null; // Ajout des valeurs par défaut pour la modification
};


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '35%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
  },
};

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onRequestClose, onSubmit, defaultValues }) => {
  const [messageAlertSiret, setMessageAlertSiret] = useState('');
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<FolderFormInputs>({
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
        const apeCode = companyData.uniteLegale.activitePrincipaleUniteLegale;
        setValue('apeCode', apeCode);
        const naf = dataApeCode.find(code => code.id === apeCode);
        if (naf) {
          setValue('activitySector', naf?.label);
        }
        setValue('siren', companyData.siren);

        const adresseEtablissement = companyData.adresseEtablissement

        setValue('address', `${adresseEtablissement.numeroVoieEtablissement} ${adresseEtablissement.typeVoieEtablissement} ${adresseEtablissement.libelleVoieEtablissement}`);
        setValue('city', adresseEtablissement.libelleCommuneEtablissement);
        setValue('postalcode', adresseEtablissement.codePostalEtablissement);
        setValue('country', 'France');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (siretValue && siretValue.length === 14) {
      fetchCompanyDetails(siretValue);
    } else {
      setMessageAlertSiret('')
      setValue('activitySector', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
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
    const { data: existingCompany } = await supabase
      .from('company')
      .select('*')
      .eq('siret', data.siret)
      .single();

    if (existingCompany) {
      setMessageAlertSiret('Une entreprise avec ce SIRET existe déjà.');
      return;
    }
    await onSubmit(data);
    reset();
  };

  const deleteFolder = async () => {
    await supabase.from('company').delete().eq('id', defaultValues?.id);
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      overlayClassName="fixed inset-0 bg-black bg-opacity-80"
      ariaHideApp={false}
    >
      <div className="flex justify-end">
        <button onClick={onRequestClose}>
          <FaTimes />
        </button>
      </div>
      <div className="flex justify-center items-center pb-2 mb-4">
        <h2 className="text-xl font-semibold">{defaultValues ? 'Modifier le dossier' : 'Ajouter un dossier'}</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-labelGray">Nom</label>
          <input
            {...register('companyName')}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="IPSUM Design SAS"
          />
          {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">SIRET</label>
          <input
            {...register('siret')}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.siret || messageAlertSiret ? 'border border-red-500' : ''}`}
            placeholder="983 067 737 00034"
          />
          {errors.siret && <p className="text-red-500 text-xs">{errors.siret.message}</p>}
          {messageAlertSiret && <p className="text-red-500 text-xs">{messageAlertSiret}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Secteur d’activité</label>
          <div className="flex items-center">
            <input
              {...register('activitySector')}
              className="mt-1 block w-full bg-white rounded py-1"
              placeholder="Conception d’interfaces"
              disabled
            />
            <FaInfoCircle className="ml-2 text-gray-400" />
          </div>
          {errors.activitySector && <p className="text-red-500 text-xs">{errors.activitySector.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Description</label>
          <textarea
            {...register('description')}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="Description du dossier"
          />
        </div>
        {defaultValues && <button onClick={deleteFolder} className='flex text-red-500'><RiDeleteBinLine className='mt-1 mr-2' /> Supprimer ce dossier</button>}
        <div className="flex justify-center">
          <button type="submit" className="bg-blue-600 text-white rounded-xl px-4 py-2 mt-4">
            {defaultValues ? 'Modifier le dossier' : 'Créer le dossier'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFolderModal;
