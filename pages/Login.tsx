
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { mockSupabase } from '../services/supabase';
import { Button, Input, Card, Modal } from '../components/common/UI';
import { ADMIN_BASE_PATH } from '../constants';
import { useNotificationStore } from '../store/notificationStore';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const setUser = useAuthStore(state => state.setUser);
  const addNotification = useNotificationStore(state => state.addNotification);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('dost_remembered_email');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data: authData, error } = await mockSupabase.auth.signIn(data.email, data.password);
      
      if (error) {
        setAuthError(error.message);
      } else if (authData?.user) {
        if (data.rememberMe) {
          localStorage.setItem('dost_remembered_email', data.email);
        } else {
          localStorage.removeItem('dost_remembered_email');
        }
        
        // @ts-ignore
        setUser(authData.user);
        addNotification({
          title: 'Welcome Back',
          message: `Successfully logged in as ${authData.user.full_name || 'Admin'}.`,
          type: 'success'
        });
        navigate(`${ADMIN_BASE_PATH}/dashboard`);
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetEmailSent(true);
      addNotification({
        title: 'Recovery Email Sent',
        message: 'Please check your inbox for instructions to reset your password.',
        type: 'info'
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F9FF] selection:bg-primary selection:text-dark">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="p-10 shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center font-bold text-dark text-4xl mx-auto mb-6 shadow-xl shadow-primary/30 animate-bounce-slow">
              D
            </div>
            <h1 className="text-3xl font-black text-dark tracking-tighter uppercase">Dost Admin</h1>
            <p className="text-gray-500 mt-2 font-medium">Control center for hospitality operations</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex gap-3 animate-in fade-in slide-in-from-top-2">
              <span>⚠️</span>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="admin@dostapp.com" 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                error={errors.email?.message}
                className="h-12 bg-gray-50/50"
              />
            </div>

            <div className="relative">
              <Input 
                label="Password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                error={errors.password?.message}
                className="h-12 bg-gray-50/50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-400 hover:text-dark transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer transition-all" 
                />
                <span className="text-sm font-bold text-gray-400 group-hover:text-dark transition-colors">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => { setIsForgotModalOpen(true); setResetEmailSent(false); }}
                className="text-sm font-black text-primary hover:text-sky-600 transition-colors uppercase tracking-widest"
              >
                Forgot?
              </button>
            </div>

            <Button type="submit" className="w-full py-4 text-sm font-black uppercase tracking-widest mt-2 shadow-xl shadow-primary/20" isLoading={loading}>
              Enter Workspace
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-gray-300 uppercase tracking-widest font-black">Powered by Dost Ecosystem © 2024</p>
          </div>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} title="Reset Password">
        {!resetEmailSent ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <p className="text-sm text-gray-500 leading-relaxed">
              Enter your registered administrator email. We'll send you a link to securely reset your credentials.
            </p>
            <Input label="Admin Email" placeholder="your@email.com" required className="bg-gray-50" />
            <div className="flex gap-3 pt-4 border-t">
               <Button variant="ghost" type="button" className="flex-1" onClick={() => setIsForgotModalOpen(false)}>Back</Button>
               <Button type="submit" className="flex-1" isLoading={loading}>Send Link</Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4">
             <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto">📧</div>
             <h3 className="text-xl font-bold">Check Your Inbox</h3>
             <p className="text-sm text-gray-500">We've sent a recovery link to your email address.</p>
             <Button variant="ghost" className="mt-6" onClick={() => setIsForgotModalOpen(false)}>Return to Login</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
