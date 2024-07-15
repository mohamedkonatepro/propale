import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { z } from 'zod';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import dataApeCode from '../../data/codes-ape.json';
import { folderSchema } from '@/schemas/folder';

type AddFolderModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
};


type FormInputs = z.infer<typeof folderSchema>;

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

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onRequestClose, onSubmit }) => {
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<FormInputs>({
    resolver: zodResolver(folderSchema),
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
        setValue('postalcode', adresseEtablissement.libelleCommuneEtablissement);
        setValue('country', 'France');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (siretValue && siretValue.length === 14) {
      fetchCompanyDetails(siretValue);
    } else {
      setValue('activitySector', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
    }
  }, [siretValue, setValue]);

  const onSubmitHandler = async (data: FormInputs) => {
    await onSubmit(data);
    reset();
  };

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
        <h2 className="text-xl font-semibold">Ajouter un dossier</h2>
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
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="983 067 737 00034"
          />
          {errors.siret && <p className="text-red-500 text-xs">{errors.siret.message}</p>}
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
        <div className="flex justify-center">
          <button type="submit" className="bg-blue-600 text-white rounded-xl px-4 py-2 mt-4">
            Créer le dossier
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFolderModal;
