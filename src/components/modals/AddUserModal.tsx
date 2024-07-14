import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { userSchema } from '@/schemas/user';
import { FaTimes } from 'react-icons/fa';
import { z } from 'zod';
import { ROLES } from '@/constants/roles';

type AddUserModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
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

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onRequestClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>({
    resolver: zodResolver(userSchema),
  });

  const onSubmitHandler = async (data: FormInputs) => {
    await onSubmit(data);
    reset();
  };

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
        <h2 className="text-xl font-semibold">Informations utilisateur</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-labelGray">Prénom</label>
            <input
              {...register('firstname')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="Jane"
            />
            {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-labelGray">Nom</label>
            <input
              {...register('lastname')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="Doe"
            />
            {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-labelGray">Rôle</label>
            <select
              {...register('role')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
            >
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.SALES}>Utilisateur</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-labelGray">Fonction</label>
            <input
              {...register('position')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="Commercial"
            />
            {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-labelGray">Email</label>
            <input
              {...register('email')}
              className="mt-1 block w-full bg-backgroundGray rounded p-2"
              placeholder="jane.doe@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div>
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
          <label className="block text-sm font-medium text-labelGray">Mot de passe</label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="***************"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>
        <div className="flex justify-center">
          <button type="submit" className="bg-blue-700 text-white rounded px-4 py-2 mt-4">
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
