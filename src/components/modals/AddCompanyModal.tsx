import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import { companySchema } from '@/schemas/company';
import { FaTimes } from 'react-icons/fa';
import { z } from 'zod';

type AddCompanyModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
};

type FormInputs = z.infer<typeof companySchema>;

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

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onRequestClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>({
    resolver: zodResolver(companySchema),
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
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold">Ajouter une entreprise</h2>
        <button onClick={onRequestClose}><FaTimes /></button>
      </div>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Informations principales entreprise</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium">Raison sociale</label>
              <input
                {...register('companyName')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="Company"
              />
              {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Numéro SIREN</label>
              <input
                {...register('siren')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="123456789"
              />
              {errors.siren && <p className="text-red-500 text-xs">{errors.siren.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Code APE</label>
              <input
                {...register('apeCode')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="9234A"
              />
              {errors.apeCode && <p className="text-red-500 text-xs">{errors.apeCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Secteur d’activité</label>
              <input
                {...register('activitySector')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder=""
              />
              {errors.activitySector && <p className="text-red-500 text-xs">{errors.activitySector.message}</p>}
            </div>
          </div>
        </div>

        <div className='mt-20'>
          <h3 className="text-lg font-medium">Contact principal</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium">Prénom</label>
              <input
                {...register('firstname')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="Paul"
              />
              {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Nom</label>
              <input
                {...register('lastname')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="Dupond"
              />
              {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Fonction</label>
              <input
                {...register('position')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="Directeur"
              />
              {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                {...register('email')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="contact@mail.fr"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Téléphone</label>
              <input
                {...register('phone')}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="0754631232"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
          </div>
        </div>
        <div className='flex justify-center'>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-4">
          Créer cette entreprise
        </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCompanyModal;