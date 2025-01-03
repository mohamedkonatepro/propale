import React from 'react';
import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { heatLevels, statuses } from '@/constants';
import CustomDropdown from '@/components/common/CustomDropdown';
import { useUser } from '@/context/userContext';
import { ROLES } from '@/constants/roles';

type MainInfoSectionProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  watch: (name: keyof T) => any;
  status: string;
  heatLevel: string;
  setStatus: (value: string) => void;
  setHeatLevel: (value: string) => void;
  messageAlertSiren: string;
  disableStatusAndHeat?: boolean;
};

const MainInfoSection = <T extends FieldValues>({ register, errors, watch, status, heatLevel, setStatus, setHeatLevel, messageAlertSiren, disableStatusAndHeat = false }: MainInfoSectionProps<T>) => {
  const { user } = useUser()
  const isProspect = user?.role === ROLES.PROSPECT ? true : false;
  return (
    <div>
      <h3 className="text-lg font-medium">Informations principales</h3>
      <div className="grid grid-cols-12 gap-4 mt-2">
        <div className="col-span-7">
          <label className="block text-sm font-medium text-labelGray">Raison sociale</label>
          <input
            {...register('name' as Path<T>)}
            className="mt-1 block w-full rounded p-2 bg-backgroundGray"
            placeholder="Company tech"
          />
          {errors.name && <p className="text-red-500 text-xs">{(errors.name as any).message}</p>}
        </div>
        <div className="col-span-2">
          <CustomDropdown disabled={disableStatusAndHeat || isProspect} options={statuses} label="Statut" selected={status} onChange={setStatus} />
        </div>
        <div className="col-span-2">
          <CustomDropdown disabled={disableStatusAndHeat || isProspect} options={heatLevels} label="Chaleur" selected={heatLevel} onChange={setHeatLevel} />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-labelGray">Numéro SIREN</label>
          <input
            {...register('siren' as Path<T>, { 
              setValueAs: (v: string) => v.replace(/\s/g, '')
            })}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.siren || messageAlertSiren ? 'border border-red-500' : ''}`}
            placeholder="123456789"
            disabled={isProspect}
          />
          {errors.siren && <p className="text-red-500 text-xs">{(errors.siren as any).message}</p>}
          {messageAlertSiren && <p className="text-red-500 text-xs">{messageAlertSiren}</p>}
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-labelGray">Code APE</label>
          <input
            {...register('ape_code' as Path<T>)}
            value={watch('ape_code')}
            className="mt-1 block w-full bg-gray-200 cursor-not-allowed rounded p-2"
            placeholder=""
            disabled
          />
          {errors.ape_code && <p className="text-red-500 text-xs">{(errors.ape_code as any).message}</p>}
        </div>
        <div className="col-span-6">
          <label className="block text-sm font-medium text-labelGray">Secteur d’activité</label>
          <input
            {...register('activity_sector' as Path<T>)}
            value={watch('activity_sector')}
            className="mt-1 block w-full bg-gray-200 cursor-not-allowed rounded p-2"
            placeholder=""
            disabled
          />
          {errors.activity_sector && <p className="text-red-500 text-xs">{(errors.activity_sector as any).message}</p>}
        </div>
      </div>
    </div>
  );
};

export default MainInfoSection;
