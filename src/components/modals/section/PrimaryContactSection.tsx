import React from 'react';
import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';

type PrimaryContactSectionProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  messageAlertEmail: string;
};

const PrimaryContactSection = <T extends FieldValues>({ register, errors, messageAlertEmail }: PrimaryContactSectionProps<T>) => {
  return (
    <div className='mt-10'>
      <h3 className="text-lg font-medium">Contact principal</h3>
      <div className="grid grid-cols-12 gap-4 mt-2">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-labelGray">Prénom</label>
          <input
            {...register('firstname' as Path<T>)}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="Paul"
          />
          {errors.firstname && <p className="text-red-500 text-xs">{(errors.firstname as any).message}</p>}
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-labelGray">Nom</label>
          <input
            {...register('lastname' as Path<T>)}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="Dupond"
          />
          {errors.lastname && <p className="text-red-500 text-xs">{(errors.lastname as any).message}</p>}
        </div>
        <div className="col-span-6">
          <label className="block text-sm font-medium text-labelGray">Fonction</label>
          <input
            {...register('position' as Path<T>)}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="commercial"
          />
          {errors.position && <p className="text-red-500 text-xs">{(errors.position as any).message}</p>}
        </div>
        <div className="col-span-6">
          <label className="block text-sm font-medium text-labelGray">Email</label>
          <input
            {...register('email' as Path<T>)}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.email || messageAlertEmail ? 'border border-red-500' : ''}`}
            placeholder="paul.dupond@mail.com"
          />
          {errors.email && <p className="text-red-500 text-xs">{(errors.email as any).message}</p>}
          {messageAlertEmail && <p className="text-red-500 text-xs">{messageAlertEmail}</p>}
        </div>
        <div className="col-span-6">
          <label className="block text-sm font-medium text-labelGray">Téléphone</label>
          <input
            {...register('phone' as Path<T>)}
            className="mt-1 block w-full bg-backgroundGray rounded p-2"
            placeholder="0762347533"
          />
          {errors.phone && <p className="text-red-500 text-xs">{(errors.phone as any).message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PrimaryContactSection;
