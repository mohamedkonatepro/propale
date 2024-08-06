import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FolderFormInputs } from '@/schemas/folder';

type FolderMainInfoSectionProps = {
  register: UseFormRegister<FolderFormInputs>;
  errors: FieldErrors<FolderFormInputs>;
  watch: (name: keyof FolderFormInputs) => any;
  messageAlertSiret: string;
};

const FolderMainInfoSection: React.FC<FolderMainInfoSectionProps> = ({ register, errors, watch, messageAlertSiret }) => {
  return (
    <div>
      <div>
        <label className="block text-sm font-medium text-labelGray">Nom</label>
        <input
          {...register('name')}
          className="mt-1 block w-full bg-backgroundGray rounded p-2"
          placeholder="IPSUM Design SAS"
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-labelGray">SIRET</label>
        <input
          {...register('siret')}
          className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.siret || messageAlertSiret ? 'border border-red-500' : ''}`}
          placeholder="983 067 737 00034"
        />
        {errors.siret && <p className="text-red-500 text-xs">{errors.siret.message}</p>}
        {messageAlertSiret && <p className="text-red-500 text-xs">{messageAlertSiret}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Secteur d’activité</label>
        <div className="flex items-center">
          <input
            {...register('activity_sector')}
            className="mt-1 block w-full bg-white rounded py-1"
            placeholder="Conception d’interfaces"
            disabled
          />
        </div>
        {errors.activity_sector && <p className="text-red-500 text-xs">{errors.activity_sector.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-labelGray">Description</label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full bg-backgroundGray rounded p-2"
          placeholder="Description du dossier"
        />
      </div>
    </div>
  );
};

export default FolderMainInfoSection;
