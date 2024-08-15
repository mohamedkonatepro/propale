import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CompanyFormInputs } from '@/schemas/company';

type CompanyMainInfoSectionProps = {
  register: UseFormRegister<CompanyFormInputs>;
  errors: FieldErrors<CompanyFormInputs>;
  watch: (name: keyof CompanyFormInputs) => any;
  messageAlertSiren: string;
};

const CompanyMainInfoSection: React.FC<CompanyMainInfoSectionProps> = ({ register, errors, watch, messageAlertSiren }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Informations principales</h3>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label className="block text-sm font-medium text-labelGray">Raison sociale</label>
          <input
            {...register('name')}
            className="mt-1 block w-full rounded p-2 bg-backgroundGray"
            placeholder="Company"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Numéro SIREN</label>
          <input
            {...register('siren', { 
              setValueAs: (v: string) => v.replace(/\s/g, '')
            })}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.siren || messageAlertSiren ? 'border border-red-500' : ''}`}
            placeholder="123456789"
          />
          {errors.siren && <p className="text-red-500 text-xs">{errors.siren.message}</p>}
          {messageAlertSiren && <p className="text-red-500 text-xs">{messageAlertSiren}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Code APE</label>
          <input
            {...register('ape_code')}
            value={watch('ape_code')}
            className="mt-1 block w-full bg-gray-200 cursor-not-allowed rounded p-2"
            placeholder="9234A"
            disabled
          />
          {errors.ape_code && <p className="text-red-500 text-xs">{errors.ape_code.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-labelGray">Secteur d’activité</label>
          <input
            {...register('activity_sector')}
            value={watch('activity_sector')}
            className="mt-1 block w-full bg-gray-200 cursor-not-allowed rounded p-2"
            placeholder=""
            disabled
          />
          {errors.activity_sector && <p className="text-red-500 text-xs">{errors.activity_sector.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default CompanyMainInfoSection;
