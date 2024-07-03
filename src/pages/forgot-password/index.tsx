import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema } from '@/schemas/auth';
import SocialLinks from '@/components/SocialLinks';
import SuccessAlert from '@/components/SuccessAlert';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import React, { useState } from 'react';

type ForgotPasswordFormInputs = {
  email: string;
};

const ForgotPassword = () => {
  const [messageSent, setMessageSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordFormInputs) => {
    const { email } = data;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/reset-password`
    });
    if (error) {
      setMessageSent(false);
    } else {
      setMessageSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-6">
            <Image src="/logo.png" alt="Propale" width={68} height={68} className="mr-2" />
            <h2 className="text-3xl font-bold">Propale</h2>
          </div>
          <h3 className="text-xl font-bold mb-6">{messageSent ? 'Vérifiez votre boîte mail' : 'Entrer votre identifiant'}</h3>
          {!messageSent ? (
            <form className="w-full" onSubmit={handleSubmit(handleForgotPassword)}>
              <p className='text-center text-sm'>Renseignez l’adresse email utilisée à l’enregistrement de votre compte.</p>
              <div className="mb-4 mt-5">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="tonadress@mail.com"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  {...register('email')}
                />
                {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
              </div>
              <div className="flex items-center justify-center">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-64 rounded-lg"
                  type="submit"
                >
                  Envoyer
                </button>
              </div>
            </form>
          ) : (
            <SuccessAlert title='Mail de réinitialisation envoyé' message='Un mail de réinitialisation de mot de passe vous a été envoyé à l’email associé au compte.' />
          )}
        </div>
        <SocialLinks />
      </div>
    </div>
  );
};

export default ForgotPassword;
