import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas/auth';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import SocialLinks from '@/components/auth/SocialLinks';
import CustomAlert from '@/components/common/Alert';
import LoginHeader from '@/components/auth/LoginHeader';
import { FcGoogle } from "react-icons/fc";
import { Button } from '@/components/common/Button';
import handleSessionAndRedirect from '@/services/authService';
import { FiEye, FiEyeOff} from "react-icons/fi";

type LoginFormInputs = {
  email: string;
  password: string;
};

const Login = () => {
  const [message, setMessage] = useState(['']);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
  });

  const handleLogin = async (data: LoginFormInputs) => {
    setIsLoading(true);
    const { email, password } = data;
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(['error', 'Adresse email ou mot de passe incorrects. Veuillez réessayer.']);
      } else {
        setMessage(['']);
        await handleSessionAndRedirect(user, session, router);
      }
    } catch (error) {
      setMessage(['error', 'Une erreur est survenue. Veuillez réessayer.']);
    } finally {
      setIsLoading(false);
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
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md flex flex-col justify-between" style={{ minHeight: '650px' }}>
        <div className="flex flex-col items-center">
          <LoginHeader />

          <h3 className="text-xl font-medium mb-6 mt-6">Connexion</h3>
          {message.length > 1 && <CustomAlert message={message[1]} />}
          
          <form className="w-full" onSubmit={handleSubmit(handleLogin)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="tonadress@mail.com"
                className="bg-backgroundGray border border-none rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
            </div>
            <div className="mb-6">
              <div className='flex justify-between'>
                <label className="block text-gray-700 text-sm font-medium mb-2">Mot de passe</label>
                <a href="#" className="text-sm text-blueCustom" onClick={navigateToForgotPassword}>Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="bg-backgroundGray border border-none rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-center">
              <Button
                className="bg-blueCustom hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline w-64 rounded-lg"
                type="submit"
                isLoading={isLoading}
              >
                Se connecter
              </Button>
            </div>
          </form>
          <div className="my-4 w-3/4 flex items-center">
            <hr className="w-full border-gray-300" />
            <span className="mx-2 text-gray-500">ou</span>
            <hr className="w-full border-gray-300" />
          </div>
          <Button
            className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-100 rounded-lg shadow flex items-center justify-center"
            type="button"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} className="mr-2" /> Se connecter avec Google
          </Button>

          <div className="mt-auto">
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
