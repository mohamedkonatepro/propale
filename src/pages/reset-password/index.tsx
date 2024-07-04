import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema } from '@/schemas/auth';
import SocialLinks from '@/components/SocialLinks';
import SuccessAlert from '@/components/SuccessAlert';
import ValidationAlertText from '@/components/ValidationAlertText';
import { supabase } from '@/lib/supabaseClient';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import LoginHeader from '@/components/LoginHeader';

type ResetPasswordFormInputs = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [passwordReset, setPasswordReset] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const handleResetPassword = async (data: ResetPasswordFormInputs) => {
    const { password } = data;
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordReset(false);
    } else {
      setPasswordReset(true);
    }
  };

  const handleRedirectToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col justify-between" style={{ minHeight: '650px' }}>
        <div className="flex flex-col items-center">
          <LoginHeader />
          <h3 className="text-xl font-bold mb-6">
            {passwordReset ? 'C’est fait.' : 'Nouveau mot de passe'}
          </h3>
          {!passwordReset ? (
            <form className="w-full" onSubmit={handleSubmit(handleResetPassword)}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Choisir un nouveau mot de passe
                </label>
                <input
                  type="password"
                  placeholder="motdepasse"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  {...register('password')}
                />
                {errors.password ? (
                  <div className='mt-2'>
                    <ValidationAlertText message='Votre mot de passe doit contenir au moins :' requirements={[
                      '8 caractères', 'Une majuscule', 'Un chiffre', 'Un caractère spécial'
                    ]} />
                  </div>
                ) : ''}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword.message}</p>}
              </div>
              <div className="flex items-center justify-center">
                <button
                  className={`text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-64 rounded-lg ${
                    errors.password || errors.confirmPassword ? 'bg-gray-200' : 'bg-blue-600 hover:bg-blue-700'
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
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-36 rounded-lg mt-5"
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