import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema } from '@/schemas/auth';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import LoginHeader from '@/components/auth/LoginHeader';
import SuccessAlert from '@/components/common/SuccessAlert';
import SocialLinks from '@/components/auth/SocialLinks';
import ValidationMessage from '@/components/common/ValidationMessage';
import { FiEye, FiEyeOff} from "react-icons/fi";

type ResetPasswordFormInputs = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const handleResetPassword = async (data: ResetPasswordFormInputs) => {
    const { password } = data;
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordReset(false);
      if (error.code === "same_password") {
        setPasswordReset(true);
      }
    } else {
      setPasswordReset(true);
    }
  };

  const handleRedirectToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col justify-between" style={{ minHeight: '650px' }}>
        <div className="flex flex-col items-center">
          <LoginHeader />
          <h3 className="text-xl font-medium mb-6 mt-6">
            {passwordReset ? 'C’est fait.' : 'Nouveau mot de passe'}
          </h3>
          {!passwordReset ? (
            <form className="w-full" onSubmit={handleSubmit(handleResetPassword)}>
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Choisir un nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    className={`bg-backgroundGray border border-none rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className='mt-2'>
                    <ValidationMessage message='Votre mot de passe doit contenir au moins :' requirements={[
                      '8 caractères', 'Une majuscule', 'Un chiffre', 'Un caractère spécial'
                    ]} />
                  </div>
                )}
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    className="bg-backgroundGray border border-none rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword.message}</p>}
              </div>
              <div className="flex items-center justify-center">
                <button
                  className={`text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-64 rounded-lg ${
                    errors.password || errors.confirmPassword ? 'bg-gray-200' : 'bg-blueCustom hover:bg-blue-700'
                  }`}
                  type="submit"
                  disabled={!!errors.password || !!errors.confirmPassword}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className='flex flex-col items-center'>
              <SuccessAlert title='Mot de passe réinitialisé' message='Votre mot de passe a bien été réinitialisé. Vous pouvez désormais vous connecter avec votre nouveau mot de passe.' />
              <button
                className="bg-blueCustom hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-36 rounded-lg mt-5"
                type="button"
                onClick={handleRedirectToLogin}
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
        <div className="mt-auto">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
