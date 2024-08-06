import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserFormInputs, userSchema } from '@/schemas/user';
import { ROLES } from '@/constants/roles';
import CustomAlert from '../common/Alert';
import { supabase } from '@/lib/supabaseClient';
import BaseModal from './BaseModal';

type AddUserModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  page?: string;
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onRequestClose, onSubmit, page }) => {
  const [messageAlertEmail, setMessageAlertEmail] = useState('');
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
  });
  
  const roleValue = watch('role', page === ROLES.SUPER_ADMIN ? ROLES.SUPER_ADMIN : ROLES.ADMIN);

  useEffect(() => {
    if (page === ROLES.SUPER_ADMIN) {
      setValue('role', ROLES.SUPER_ADMIN);
    }
  }, [page, setValue]);
  
  const onSubmitHandler = async (data: UserFormInputs) => {
    const { data: profileFata } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', watch('email'));

    if (profileFata && profileFata.length > 0) {
      setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
      return;
    }
    await onSubmit(data);
    reset();
  };

  const emailValue = watch('email')
  useEffect(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailValue || !emailPattern.test(emailValue)) {
      setMessageAlertEmail('');
    }
  }, [emailValue]);

  return (
      <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title={'Ajouter un utilisateur'}>
      {messageAlertEmail && <CustomAlert message={messageAlertEmail} title='Adresse mail déjà utilisée'/>}
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4 px-20">
        <div className="grid grid-cols-12 gap-4 mt-2">
          <div className='col-span-6'>
            <label className="block text-sm font-medium text-labelGray">Prénom*</label>
            <input
              {...register('firstname')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="Jane"
            />
            {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
          </div>
          <div className='col-span-6'>
            <label className="block text-sm font-medium text-labelGray">Nom*</label>
            <input
              {...register('lastname')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="Doe"
            />
            {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
          </div>
          <div className='col-span-5'>
            <label className="block text-sm font-medium text-labelGray">Rôle*</label>
            <select
              {...register('role')}
              value={roleValue}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              onChange={(e) => setValue('role', e.target.value)}
              disabled={page === ROLES.SUPER_ADMIN}
            >
                {page !== ROLES.SUPER_ADMIN && (
                  <>
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.SALES}>Utilisateur</option>
                  </>
                )}
                {page === ROLES.SUPER_ADMIN && (
                  <>
                    <option value={ROLES.SUPER_ADMIN}>Super admin</option>
                  </>
                )}
            </select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>
          <div className='col-span-7'>
            <label className="block text-sm font-medium text-labelGray">Fonction</label>
            <input
              {...register('position')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="Commercial"
            />
            {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
          </div>
          <div className='col-span-8'>
            <label className="block text-sm font-medium text-labelGray">Email*</label>
            <input
              {...register('email')}
              className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.email || messageAlertEmail ? 'border border-red-500' : ''}`}
              placeholder="jane.doe@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div className='col-span-4'>
            <label className="block text-sm font-medium text-labelGray">Téléphone</label>
            <input
              {...register('phone')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="06 12 34 56 78"
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
          </div>
        </div>
        <div>
          <p className="text-xs">*Champs obligatoires</p>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex justify-center">
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-4 w-1/4">
              Créer
            </button>
          </div>
          <p className="text-center text-labelGray text-base mt-3">Un mail de création de mot de passe sera envoyé à l’adresse mail de l’utilisateur.</p>
        </div>
      </form>
      </BaseModal>
  );
};

export default AddUserModal;
