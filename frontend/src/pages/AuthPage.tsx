import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { User } from '../types';
import { apiClient } from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).default('PATIENT'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    consent: z.boolean().refine((val) => val === true, 'You must agree to the clinical intake consent & privacy notice'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

interface AuthFormData {
  fullName?: string;
  email: string;
  phone?: string;
  role?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  password: string;
  confirmPassword?: string;
  consent?: boolean;
}

interface AuthPageProps {
  mode: 'login' | 'register';
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as any,
    defaultValues: {
      role: 'PATIENT',
      consent: false,
    },
  });

  const onSubmit = async (data: any) => {
    setApiError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await apiClient.post(endpoint, data);

      if (response.data && response.data.success) {
        const { user, token } = response.data.data;
        onLoginSuccess(user, token);

        if (user.role === 'DOCTOR') navigate('/doctor-dashboard');
        else if (user.role === 'ADMIN') navigate('/admin-dashboard');
        else navigate('/patient-dashboard');
        return;
      } else {
        setApiError(response.data?.message || 'Authentication operation was unsuccessful.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
    setApiError(null);
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 sm:px-6">
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-mineral-200/80 shadow-glass">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center font-bold text-2xl text-sage-700 mx-auto mb-4 shadow-sm">
            🌿
          </div>
          <span className="text-[11px] font-bold text-sage-600 uppercase tracking-widest block mb-1">
            St. Jude Modern HealthCare
          </span>
          <h2 className="font-heading text-3xl font-black text-mineral-900 tracking-tight">
            {isLogin ? 'Sign In to Your Portal' : 'Patient Registration'}
          </h2>
          <p className="text-xs text-mineral-500 mt-1.5 font-light">
            {isLogin
              ? 'Access clinical records, active waiting queues, and appointments'
              : 'Create an account to submit intake forms and schedule consultations'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-surface border border-mineral-200 rounded-xl mb-6 text-xs font-semibold">
          <Link
            to="/login"
            className={`py-2 text-center rounded-lg transition-all ${
              isLogin ? 'bg-white text-mineral-900 shadow-sm font-bold' : 'text-mineral-500 hover:text-mineral-900'
            }`}
          >
            Portal Login
          </Link>
          <Link
            to="/register"
            className={`py-2 text-center rounded-lg transition-all ${
              !isLogin ? 'bg-white text-mineral-900 shadow-sm font-bold' : 'text-mineral-500 hover:text-mineral-900'
            }`}
          >
            New Registration
          </Link>
        </div>

        {/* Quick Fill Helpers for Testing Portals */}
        {isLogin && (
          <div className="mb-6 p-3.5 bg-sage-50/70 border border-sage-200/60 rounded-xl text-xs">
            <div className="flex items-center justify-between text-sage-700 mb-2 font-medium">
              <span>Quick Account Autofill:</span>
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold">Standard Password: Password123!</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillQuickCredentials('john.doe@example.com')}
                className="py-1.5 px-2 rounded-lg bg-white border border-sage-300/80 hover:bg-sage-100/50 text-mineral-800 font-medium transition-colors"
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('dr.smith@hospital.com')}
                className="py-1.5 px-2 rounded-lg bg-white border border-clay-300/80 hover:bg-clay-100/50 text-clay-900 font-medium transition-colors"
              >
                Physician
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@hospital.com')}
                className="py-1.5 px-2 rounded-lg bg-white border border-mineral-300/80 hover:bg-mineral-100/50 text-mineral-900 font-medium transition-colors"
              >
                Administrator
              </button>
            </div>
          </div>
        )}

        <ErrorMessage message={apiError || undefined} />
        {successNotice && (
          <div className="p-3 mb-4 rounded-xl bg-sage-50 border border-sage-300 text-xs text-sage-800 font-medium">
            {successNotice}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <>
              <InputField
                label="Full Legal Name"
                placeholder="e.g. Eleanor Vance"
                required
                {...register('fullName')}
                error={errors.fullName?.message as string}
              />

              <InputField
                label="Phone Number"
                type="tel"
                placeholder="e.g. +1 (555) 234-5678"
                {...register('phone')}
                error={errors.phone?.message as string}
              />

              <SelectField
                label="Account Profile Role"
                options={[
                  { value: 'PATIENT', label: 'Patient (Self Intake & Appointments)' },
                  { value: 'DOCTOR', label: 'Attending Physician' },
                  { value: 'ADMIN', label: 'Hospital Operations Administrator' },
                ]}
                {...register('role')}
                error={errors.role?.message as string}
              />
            </>
          )}

          <InputField
            label="Email Address"
            type="email"
            placeholder="patient@hospital.org"
            required
            {...register('email')}
            error={errors.email?.message as string}
          />

          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              required
              {...register('password')}
              error={errors.password?.message as string}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-xs font-semibold text-mineral-500 hover:text-mineral-800 transition-colors"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {!isLogin && (
            <InputField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              required
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message as string}
            />
          )}

          {!isLogin && (
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="consent"
                className="mt-1 rounded border-mineral-300 text-sage-600 focus:ring-sage-500 cursor-pointer"
                {...register('consent')}
              />
              <label htmlFor="consent" className="text-xs text-mineral-600 leading-relaxed cursor-pointer">
                I agree to the St. Jude HealthCare privacy policy, electronic medical intake consent, and online triage terms.
              </label>
            </div>
          )}
          {errors.consent && <p className="text-xs text-rose-600">{errors.consent.message as string}</p>}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3.5 text-base font-bold bg-mineral-900 hover:bg-mineral-800 text-white rounded-xl shadow-sm transition-all"
            isLoading={loading}
          >
            {isLogin ? 'Sign In' : 'Create Hospital Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-mineral-500 border-t border-mineral-100 pt-5">
          {isLogin ? (
            <>
              Need a patient intake account?{' '}
              <Link to="/register" className="font-bold text-sage-700 hover:text-sage-800 underline underline-offset-2">
                Register here
              </Link>
            </>
          ) : (
            <>
              Already registered?{' '}
              <Link to="/login" className="font-bold text-sage-700 hover:text-sage-800 underline underline-offset-2">
                Sign in to your portal
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
