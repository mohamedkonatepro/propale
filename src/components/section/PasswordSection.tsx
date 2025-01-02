import React, { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { companyDetailsInputs } from '@/schemas/company';

type PasswordSectionProps = {
  register: UseFormRegister<companyDetailsInputs>;
  errors: FieldErrors<companyDetailsInputs>;
};

const PasswordSection: React.FC<PasswordSectionProps> = ({ register, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-12 gap-4 mt-2">
        {/* Mot de passe */}
        <div className="col-span-6 relative">
          <label className="block text-sm font-medium text-labelGray">Mot de passe</label>
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password', { required: "Le mot de passe est requis" })}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 pr-10 ${
              errors.password ? 'border border-red-500' : ''
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>

        {/* Confirmer le mot de passe */}
        <div className="col-span-6 relative">
          <label className="block text-sm font-medium text-labelGray">Confirmer le mot de passe</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword', { required: "La confirmation du mot de passe est requise" })}
            className={`mt-1 block w-full bg-backgroundGray rounded p-2 pr-10 ${
              errors.confirmPassword ? 'border border-red-500' : ''
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default PasswordSection;
