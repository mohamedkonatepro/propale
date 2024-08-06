import React from 'react';
import { UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister, FieldErrors } from 'react-hook-form';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ROLES } from '@/constants/roles';
import { FormInputs } from '../AddProspectModal';

type AdditionalContactsSectionProps = {
  fields: any[];
  register: UseFormRegister<FormInputs>;
  errors: FieldErrors<FormInputs>;
  append: UseFieldArrayAppend<FormInputs>;
  remove: UseFieldArrayRemove;
  messageAlertAdditionalEmails: string;
};

const AdditionalContactsSection: React.FC<AdditionalContactsSectionProps> = ({
  fields, register, errors, append, remove, messageAlertAdditionalEmails
}) => {
  return (
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
                  errors.additionalContacts?.[index]?.email || messageAlertAdditionalEmails ? 'border border-red-500' : ''
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
      <button
        onClick={() => append({ firstname: '', lastname: '', position: '', email: '', phone: '', role: ROLES.PROSPECT })}
        type="button"
        className="text-blue-500 mt-4"
      >
        + Ajouter un contact
      </button>
      {messageAlertAdditionalEmails && <p className="text-red-500 text-xs">{messageAlertAdditionalEmails}</p>}
    </div>
  );
};

export default AdditionalContactsSection;
