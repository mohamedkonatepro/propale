import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { userSchema } from '@/schemas/user';
import { FaTimes } from 'react-icons/fa';
import { z } from 'zod';
import { ROLES } from '@/constants/roles';
import CustomAlert from '../common/Alert';

type AddUserModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<string | null | undefined>;
  page?: string;
};

type FormInputs = z.infer<typeof userSchema>;

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
  },
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onRequestClose, onSubmit, page }) => {
  const [messageAlertEmail, setMessageAlertEmail] = useState('');
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormInputs>({
    resolver: zodResolver(userSchema),
  });
  
  const roleValue = watch('role', page === ROLES.SUPER_ADMIN ? ROLES.SUPER_ADMIN : ROLES.ADMIN);

  useEffect(() => {
    if (page === ROLES.SUPER_ADMIN) {
      setValue('role', ROLES.SUPER_ADMIN);
    }
  }, [page, setValue]);
  
  const onSubmitHandler = async (data: FormInputs) => {
    const result = await onSubmit(data);
    if (result === 'email_already_exists') {
      setMessageAlertEmail('Un compte utilisateur existe déjà pour cette adresse mail.');
      return
    }
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      overlayClassName="fixed inset-0 bg-black bg-opacity-90"
      ariaHideApp={false}
    >
      <div className="flex justify-end">
        <button onClick={onRequestClose}>
          <FaTimes />
        </button>
      </div>
      <div className="flex justify-center items-center pb-2 mb-4">
        <h2 className="text-xl font-semibold">Ajouter un utilisateur</h2>
      </div>
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
    </Modal>
  );
};

export default AddUserModal;
