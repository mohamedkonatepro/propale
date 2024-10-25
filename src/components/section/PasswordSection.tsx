import { companyDetailsInputs } from '@/schemas/company';
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

type PasswordSectionProps = {
  register: UseFormRegister<companyDetailsInputs>;
  errors: FieldErrors<companyDetailsInputs>;
};

const PasswordSection: React.FC<PasswordSectionProps> = ({ register, errors }) => {
  return (
    <div className="mt-10">
      <div className="grid grid-cols-12 gap-4 mt-2">
        <div className="col-span-6">
          <label className="block text-sm font-medium text-labelGray">Mot de passe</label>
          <input
            type="password"
            {...register('password', { required: "Le mot de passe est requis" })}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.password ? 'border border-red-500' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>
        <div className="col-span-6">
          <label className="block text-sm font-medium text-labelGray">Confirmer le mot de passe</label>
          <input
            type="password"
            {...register('confirmPassword', { required: "La confirmation du mot de passe est requise" })}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 ${errors.confirmPassword ? 'border border-red-500' : ''}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PasswordSection;
