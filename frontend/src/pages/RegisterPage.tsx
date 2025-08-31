import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Fuel, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.username, data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full">
              <Fuel className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Krijo Llogari
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
                          Bashkohu me Sistemin e Menaxhimit të Rezervuarëve të Naftës
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Emri i përdoruesit
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('username', {
                    required: 'Emri i përdoruesit është i detyrueshëm',
                    minLength: {
                      value: 3,
                      message: 'Emri i përdoruesit duhet të ketë të paktën 3 karaktere',
                    },
                  })}
                  type="text"
                  autoComplete="username"
                  className="input pl-10"
                  placeholder="Shkruaj emrin tënd të përdoruesit"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>



            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Fjalëkalimi
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'Fjalëkalimi është i detyrueshëm',
                    minLength: {
                      value: 6,
                      message: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pr-10"
                  placeholder="Shkruaj fjalëkalimin tënd"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmo Fjalëkalimin
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Ju lutem konfirmoni fjalëkalimin',
                    validate: (value) =>
                      value === password || 'Fjalëkalimet nuk përputhen',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pr-10"
                  placeholder="Konfirmo fjalëkalimin tënd"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Duke krijuar llogarinë...
                  </>
                ) : (
                  'Krijo llogarinë'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Ke tashmë një llogari?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Hyr
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 