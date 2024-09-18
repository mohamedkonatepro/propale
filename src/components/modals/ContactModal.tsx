import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import BaseModal from './BaseModal';
import { FaArrowLeft } from "react-icons/fa";
import { Profile } from '@/types/models';
import { GrFormEdit } from 'react-icons/gr';
import Image from 'next/image';
import { Switch } from '../common/Switch';
import { ROLES } from '@/constants/roles';

interface ContactModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onRequestBack?: () => void;
  onSubmit: (data: Profile) => void;
  defaultValues?: Profile;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onRequestClose, onSubmit, onRequestBack, defaultValues }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch} = useForm<Profile>();
  setValue('role', ROLES.PROSPECT);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset({
        firstname: '',
        lastname: '',
        position: '',
        email: '',
        phone: '',
        role: ROLES.PROSPECT,
        is_primary_contact: false,
      });
    }
  }, [defaultValues, reset, isOpen]);

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Contact">
      {onRequestBack && <div className='flex items-center fixed top-6 left-3 cursor-pointer' onClick={onRequestBack}>
        <FaArrowLeft className='text-blueCustom' /> <div className='ml-2 text-blueCustom'>Retour</div>
      </div>}
      <div className="flex flex-col items-center mb-4 mt-5">
        <div className="relative">
          <div className="mr-3 rounded-full bg-blue-100 w-full p-6">
            <Image src="/image-to-upload.svg" alt="User" width={20} height={20} className="mr-5 bg-blue-100 w-full" />
          </div>
          <button className="absolute top-0 right-0 bg-white rounded-lg">
            <GrFormEdit className="text-blueCustom" size={30} />
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-labelGray">Prénom</label>
            <input
              {...register('firstname', { required: 'Ce champ est requis' })}
              className="mt-1 block w-full rounded p-2 bg-backgroundGray"
              placeholder="Prénom"
            />
            {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-labelGray">Nom</label>
            <input
              {...register('lastname', { required: 'Ce champ est requis' })}
              className="mt-1 block w-full rounded p-2 bg-backgroundGray"
              placeholder="Nom"
            />
            {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Fonction</label>
          <input
            {...register('position')}
            className="mt-1 block w-full rounded p-2 bg-backgroundGray"
            placeholder="Fonction"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Email</label>
          <input
            {...register('email', { required: 'Ce champ est requis' })}
            className="mt-1 block w-full rounded p-2 bg-backgroundGray"
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Téléphone</label>
          <input
            {...register('phone')}
            className="mt-1 block w-full rounded p-2 bg-backgroundGray"
            placeholder="06 12 34 56 78"
          />
        </div>
        <div className="flex items-center">
          <label className="ml-2 mr-5 block text-sm font-medium text-labelGray">
            Définir comme contact principal
          </label>
          <Switch
              checked={watch('is_primary_contact')}
              onCheckedChange={(is_primary_contact) => setValue('is_primary_contact', is_primary_contact)}
              {...register('is_primary_contact')}
            />
        </div>
        <div className="flex justify-center">
          <button type="submit" className="bg-blueCustom text-white rounded-xl px-4 py-2 mt-4">
            {defaultValues ? 'Modifier le contact' : 'Créer le contact'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ContactModal;
