import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas/auth';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaGoogle, FaFacebook, FaWhatsapp, FaLinkedin, FaTwitter } from 'react-icons/fa';
import SocialLinks from '@/components/SocialLinks';
import CustomAlert from '@/components/Alert';

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(['error', 'Adresse email ou mot de passe incorrects. Veuillez réessayer.']);
    } else {
      setMessage(['']);
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const data = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/callback`,
      },
    });
    if (data.error) {
      setMessage(['error', 'Erreur lors de la connexion avec Google.']);
    } else {
      setMessage(['']);
    }
  };

  const navigateToForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-6">
            <Image src="/logo.png" alt="Propale" width={68} height={68} className="mr-2" />
            <h2 className="text-3xl font-bold">Propale</h2>
          </div>

          <h3 className="text-xl font-bold mb-6">Connexion</h3>
          {message.length > 1 && <CustomAlert message={message[1]} />}
          
          <form className="w-full mt-5" onSubmit={handleSubmit(handleLogin)}>
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
            <Image src="/Group.svg" alt="google" width={24} height={24} className="mr-2" /> Se connecter avec Google
          </button>

          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default Login;
