import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas/auth';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SocialLinks from '@/components/auth/SocialLinks';
import CustomAlert from '@/components/common/Alert';
import LoginHeader from '@/components/auth/LoginHeader';
import { FcGoogle } from "react-icons/fc";
import { fetchCompanyWithoutParentByProfileId } from '@/services/companyService';

type LoginFormInputs = {
  email: string;
  password: string;
};

const Login = () => {
  const [message, setMessage] = useState(['']);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
  });

  const handleLogin = async (data: LoginFormInputs) => {
    const { email, password } = data;
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(['error', 'Adresse email ou mot de passe incorrects. Veuillez réessayer.']);
    } else {
      setMessage(['']);
      if (user) {
        const company = await fetchCompanyWithoutParentByProfileId(user?.id);
        if (company) {
          router.push(`/dashboard/folders/${company.id}`);
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      },
    });
  };

  const navigateToForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col justify-between" style={{ minHeight: '650px' }}>
        <div className="flex flex-col items-center">
          <LoginHeader />

          <h3 className="text-xl font-bold mb-6">Connexion</h3>
          {message.length > 1 && <CustomAlert message={message[1]} />}
          
          <form className="w-full" onSubmit={handleSubmit(handleLogin)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                placeholder="tonadress@mail.com"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
            </div>
            <div className="mb-6">
              <div className='flex justify-between'>
                <label className="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
                <a href="#" className="text-sm text-blue-500" onClick={navigateToForgotPassword}>Mot de passe oublié ?</a>
              </div>
              <input
                type="password"
                placeholder="********"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-64 rounded-lg"
                type="submit"
              >
                Se connecter
              </button>
            </div>
          </form>
          <div className="my-4 w-full flex items-center">
            <hr className="w-full border-gray-300" />
            <span className="mx-2 text-gray-500">ou</span>
            <hr className="w-full border-gray-300" />
          </div>
          <button
            className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-100 rounded shadow w-full flex items-center justify-center"
            type="button"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} className="mr-2" /> Se connecter avec Google
          </button>

          <div className="mt-auto">
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
