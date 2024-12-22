import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { GrFormEdit } from "react-icons/gr";
import Modal from 'react-modal';
import Image from 'next/image';
import { Profile } from '@/types/models';
import { ROLES } from '@/constants/roles';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-toastify';
import { sendPasswordResetEmail } from '@/services/userService';
import { Checkbox } from '../common/Checkbox';
import { Switch } from '../common/Switch';

type EditUserModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => void;
  defaultValues: Profile;
};

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
    overflow: 'auto',
  },
};

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onRequestClose,
  onSubmit,
  defaultValues,
}) => {
  const [edit, setEdit] = useState(false)
  const { register, handleSubmit, formState: { errors }, getValues, setValue, watch, reset } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset();
    }
  }, [defaultValues, reset, isOpen]);
  
  const onSubmitHandler = (data: any) => {
    onSubmit(data);
  };

  const handleResetPassword = async () => {
    const email = getValues('email');
    const { error } = await sendPasswordResetEmail(email);

    if (error) {
      toast.error('Erreur lors de l\'envoi de l\'email de réinitialisation de mot de passe: ' + error.message);
    } else {
      toast.success('Email de réinitialisation de mot de passe envoyé avec succès');
    }
  };

  const handleClose = () => {
    reset();
    setEdit(false);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className="flex justify-end">
        <button onClick={handleClose} className="text-gray-500">
          <FaTimes size={20} />
        </button>
      </div>
      <div className="flex justify-center items-center pb-2 mb-4">
        <h2 className="text-xl font-medium">Informations utilisateur</h2> 
        {!edit && <button type="button" className="text-sm text-blueCustom flex ml-2" onClick={() => setEdit(true)}><GrFormEdit className="text-blueCustom" size={25} /> <div className='mt-1'>Modifier</div></button> }
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div className='flex'>
        <div className="flex flex-col items-center mt-4 px-10">
          <div className="relative">
            <div className="mr-3 rounded-full bg-blue-100 w-full p-6">
              <Image src="/image-to-upload.svg" alt="User" width={30} height={30} className="mr-5 bg-blue-100 w-full" />
            </div>
            {edit && <button className="absolute top-0 right-0 bg-white rounded-lg">
              <GrFormEdit className="text-blueCustom" size={30} />
            </button>}
          </div>
          <h3 className="text-lg font-medium mt-4">{defaultValues.firstname} {defaultValues.lastname}</h3>
          <div className='flex'><label className="text-sm font-medium text-black">ID : </label><p className="text-sm text-gray-500 ml-1">{defaultValues.code}</p></div>
          {!edit && <span className={`text-sm border px-5 py-1 rounded-full mt-5 ${defaultValues.blocked ? 'bg-red-100 text-red-600 border-red-600' : 'bg-green-100 text-green-600 border-green-600'}`}>
            {defaultValues.blocked ? 'Inactif' : 'Actif'}
          </span>}
          {edit && <div className="flex items-center space-x-2 mt-5">
            <span>{watch('blocked') ? 'Inactif' : 'Actif'}</span>
            <Switch
              checked={!watch('blocked')}
              onCheckedChange={(checked) => setValue('blocked', !checked)}
              {...register('blocked')}
            />
          </div>}
          <div className="mt-16 text-left">
            <label className="block text-sm font-medium text-labelGray">Date de création</label>
            <span>{formatDate(defaultValues?.created_at)}</span>
            <label className="block text-sm font-medium text-labelGray mt-5">Dernière modification</label>
            <span>{formatDate(defaultValues?.updated_at)}</span>
          </div>
        </div>
        <div className='ml-10'>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-labelGray">Prénom</label>
              <input
                {...register('firstname')}
                className={`mt-1 block w-6/12 ${edit ? 'bg-backgroundGray rounded p-2' : 'border-none bg-white'}`}
                placeholder="Jane"
                disabled={edit ? false : true}
              />
              {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Nom</label>
              <input
                {...register('lastname')}
                className={`mt-1 block w-6/12 ${edit ? 'bg-backgroundGray rounded p-2' : 'border-none bg-white'}`}
                placeholder="Doe"
                disabled={edit ? false : true}
              />
              {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Rôle</label>
              <select
                {...register('role')}
                className={`mt-1 block w-8/12 ${edit ? 'bg-backgroundGray rounded p-2' : 'border-none bg-white'}`}
                disabled={!edit}
              >
                {defaultValues.role === ROLES.SALES && (
                  <>
                    <option value={ROLES.SALES}>Utilisateur</option>
                  </>
                )}
                {defaultValues.role === ROLES.ADMIN && (
                  <>
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.SALES}>Utilisateur</option>
                  </>
                )}
                {defaultValues.role === ROLES.SUPER_ADMIN && (
                  <>
                    <option value={ROLES.SUPER_ADMIN}>Super admin</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.SALES}>Utilisateur</option>
                  </>
                )}
              </select>
              {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-labelGray">Fonction</label>
              <input
                {...register('position')}
                className={`mt-1 block w-8/12 ${edit ? 'bg-backgroundGray rounded p-2' : 'border-none bg-white'}`}
                disabled={edit ? false : true}
              />
              {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Email</label>
              <input
                {...register('email')}
                className={`mt-1 block w-full ${edit ? 'bg-backgroundGray rounded p-2' : 'border-none bg-white'}`}
                disabled
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Téléphone</label>
              <input
                {...register('phone')}
                className={`mt-1 block w-11/12 ${edit ? 'bg-backgroundGray rounded p-2' : 'border-none bg-white'}`}
                disabled={edit ? false : true}
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
          </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-labelGray">Mot de passe</label>
            <input
              type="password"
              className="mt-1 block w-full border-none bg-white"
              placeholder="***************"
              disabled
            />
          </div>
          <div className="mt-4 text-center">
            <button type="button" className="text-sm text-blueCustom" onClick={handleResetPassword}>Envoyer un lien de réinitialisation de mot de passe</button>
          </div>
          {edit && <div className="flex mt-4">
            <button type="submit" className="bg-blueCustom text-white rounded px-4 py-2">
              Enregistrer
            </button>
          </div>}
        </div>
      </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
