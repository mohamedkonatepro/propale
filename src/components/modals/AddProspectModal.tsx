import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { companySchema } from '@/schemas/company';
import { FaTimes, FaRegTrashAlt } from 'react-icons/fa';
import { z } from 'zod';
import axios from 'axios';
import { ROLES } from '@/constants/roles';
import dataApeCode from '../../data/codes-ape.json';
import { Company } from '@/types/models';
import { CiFolderOn } from "react-icons/ci";
import CustomDropdown from '../common/CustomDropdown';
import { heatLevels, statuses } from '@/constants';

type AddProspectModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<string | null | undefined>;
  company: Company;
};

type FormInputs = z.infer<typeof companySchema> & {
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
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
    overflow: 'auto',
  },
};

const AddProspectModal: React.FC<AddProspectModalProps> = ({ isOpen, onRequestClose, onSubmit, company }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<FormInputs>({
    resolver: zodResolver(companySchema.extend({
      additionalContacts: z.array(z.object({
        firstname: z.string().min(1, "Prénom est requis"),
        lastname: z.string().min(1, "Nom est requis"),
        position: z.string().optional(),
        role: z.string().default(ROLES.PROSPECT),
        email: z.string().email("Email invalide").min(1, "Email est requis"),
        phone: z.string().optional(),
      })).default([]) // Ensure this defaults to an empty array
    })),
    defaultValues: {
      companyName: '',
      siren: '',
      apeCode: '',
      activitySector: '',
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

  const onSubmitHandler = async (data: FormInputs) => {
    const result = await onSubmit({ ...data, status, heatLevel, companyId: company.id });
    if (result === 'email_already_exists') {
      setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
      return;
    }
    reset();
    setStatus(statuses[0].value);
    setHeatLevel(heatLevels[0].value);
  };

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
        const apeCode = companyData.periodesUniteLegale[0].activitePrincipaleUniteLegale;
        setValue('apeCode', apeCode);
        const naf = dataApeCode.find(code => code.id === apeCode);
        if (naf) {
          setValue('activitySector', naf?.label);
        }

        const responseSearch = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}`);
        const companySearch = responseSearch.data.results[0].siege;
        setValue('address', `${companySearch.numero_voie} ${companySearch.type_voie} ${companySearch.libelle_voie}`);
        setValue('city', companySearch.libelle_commune);
        setValue('postalcode', companySearch.code_postal);
        setValue('country', 'France');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (sirenValue && sirenValue.length === 9) {
      fetchCompanyDetails(sirenValue);
    } else {
      setMessageAlertSiren('');
      setValue('activitySector', '');
      setValue('apeCode', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
    }
  }, [sirenValue, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      overlayClassName="fixed inset-0 bg-black bg-opacity-90"
      ariaHideApp={false}
    >
      <div className="flex justify-end items-center pb-2 mb-4">
        <button onClick={onRequestClose}><FaTimes /></button>
      </div>
      <div className="flex flex-col justify-center items-center border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold">Ajouter un prospect</h2>
        <div className='flex items-center justify-center text-labelGray mt-3'><CiFolderOn /> <p className='ml-2'>{company.name}</p></div>
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Informations principales</h3>
          <div className="grid grid-cols-12 gap-4 mt-2">
            <div className="col-span-7">
              <label className="block text-sm font-medium text-labelGray">Raison sociale</label>
              <input
                {...register('companyName')}
                className="mt-1 block w-full rounded p-2 bg-backgroundGray"
                placeholder="Company tech"
              />
              {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
            </div>
            <div className="col-span-2">
              <CustomDropdown options={statuses} label="Statut" selected={status} onChange={setStatus} />
            </div>
            <div className="col-span-2">
              <CustomDropdown options={heatLevels} label="Chaleur" selected={heatLevel} onChange={setHeatLevel} />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Numéro SIREN</label>
              <input
                {...register('siren')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="123456789"
              />
              {errors.siren && <p className="text-red-500 text-xs">{errors.siren.message}</p>}
              {messageAlertSiren && <p className="text-red-500 text-xs">{messageAlertSiren}</p>}
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Code APE</label>
              <input
                {...register('apeCode')}
                value={watch('apeCode')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder=""
                disabled
              />
              {errors.apeCode && <p className="text-red-500 text-xs">{errors.apeCode.message}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Secteur d’activité</label>
              <input
                {...register('activitySector')}
                value={watch('activitySector')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder=""
                disabled
              />
              {errors.activitySector && <p className="text-red-500 text-xs">{errors.activitySector.message}</p>}
            </div>
          </div>
        </div>

        <div className='mt-10'>
          <h3 className="text-lg font-medium">Contact principal</h3>
          <div className="grid grid-cols-12 gap-4 mt-2">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Prénom</label>
              <input
                {...register('firstname')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="Paul"
              />
              {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-labelGray">Nom</label>
              <input
                {...register('lastname')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="Dupond"
              />
              {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Fonction</label>
              <input
                {...register('position')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="commercial"
              />
              {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Email</label>
              <input
                {...register('email')}
                className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.email || messageAlertEmail ? 'border border-red-500' : ''}`}
                placeholder="paul.dupond@mail.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              {messageAlertEmail && <p className="text-red-500 text-xs">{messageAlertEmail}</p>}
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-labelGray">Téléphone</label>
              <input
                {...register('phone')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="0762347533"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        <div className='mt-10'>
          {fields.map((field, index) => (
            <div key={field.id} className='mt-10'>
              <div className="flex items-center">
                <h3 className="text-lg font-medium mr-5">Contacts supplémentaires {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaRegTrashAlt />
                </button>
              </div>
              <div className="grid grid-cols-12 gap-4 mt-2">
                <input
                  {...register(`additionalContacts.${index}.role` as const)}
                  defaultValue={ROLES.PROSPECT}
                  type='hidden'
                />
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-labelGray">Prénom</label>
                  <input
                    {...register(`additionalContacts.${index}.firstname` as const, { required: 'Prénom est requis' })}
                    className="mt-1 block w-full bg-backgroundGray rounded p-2"
                    placeholder="Paul"
                    defaultValue={field.firstname}
                  />
                  {errors.additionalContacts?.[index]?.firstname && (
                    <p className="text-red-500 text-xs">{errors.additionalContacts[index]?.firstname?.message}</p>
                  )}
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-labelGray">Nom</label>
                  <input
                    {...register(`additionalContacts.${index}.lastname` as const, { required: 'Nom est requis' })}
                    className="mt-1 block w-full bg-backgroundGray rounded p-2"
                    placeholder="Dupond"
                    defaultValue={field.lastname}
                  />
                  {errors.additionalContacts?.[index]?.lastname && (
                    <p className="text-red-500 text-xs">{errors.additionalContacts[index]?.lastname?.message}</p>
                  )}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-labelGray">Fonction</label>
                  <input
                    {...register(`additionalContacts.${index}.position` as const)}
                    className="mt-1 block w-full bg-backgroundGray rounded p-2"
                    placeholder="commercial"
                    defaultValue={field.position}
                  />
                  {errors.additionalContacts?.[index]?.position && (
                    <p className="text-red-500 text-xs">{errors.additionalContacts[index]?.position?.message}</p>
                  )}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-labelGray">Email</label>
                  <input
                    {...register(`additionalContacts.${index}.email` as const, { required: 'Email est requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
                    className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${
                      errors.additionalContacts?.[index]?.email ? 'border border-red-500' : ''
                    }`}
                    placeholder="paul.dupond@mail.com"
                    defaultValue={field.email}
                  />
                  {errors.additionalContacts?.[index]?.email && (
                    <p className="text-red-500 text-xs">{errors.additionalContacts[index]?.email?.message}</p>
                  )}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-labelGray">Téléphone</label>
                  <input
                    {...register(`additionalContacts.${index}.phone` as const)}
                    className="mt-1 block w-full bg-backgroundGray rounded p-2"
                    placeholder="0762347533"
                    defaultValue={field.phone}
                  />
                  {errors.additionalContacts?.[index]?.phone && (
                    <p className="text-red-500 text-xs">{errors.additionalContacts[index]?.phone?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button 
            onClick={() => append({ firstname: '', lastname: '', position: '', email: '', phone: '', role: ROLES.PROSPECT })}
            type="button"
            className="text-blue-500">
            + Ajouter un contact
          </button>
        </div> 

        <div className='flex justify-center'>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-4">
            Créer le prospect
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProspectModal;
