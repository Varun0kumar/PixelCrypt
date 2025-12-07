// src/pages/SignupPage.js
import React, { useState } from 'react';
import { Mail, Lock, UserPlus, RefreshCw } from 'lucide-react';
import { AuthLayout, InputField } from '../components/Shared';
import { validateEmail, validatePassword } from '../utils/validation';

const SignupPage = ({ onNavigate, onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateEmail(email)) newErrors.email = "Invalid Email";
    if (!validatePassword(password)) newErrors.password = "Weak Password";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignup();
    }, 1000);
  };

  return (
    <AuthLayout title="Initialize Account" subtitle="Create your encrypted identity profile.">
      <form onSubmit={handleSubmit}>
        <InputField 
          label="Email Identity" 
          type="email" 
          placeholder="agent@pixelcrypt.io" 
          icon={Mail} 
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }}
          error={errors.email}
        />
        <InputField 
          label="Passphrase" 
          type="password" 
          placeholder="••••••••••••" 
          icon={Lock} 
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }}
          error={errors.password}
          helpText="8+ chars, Uppercase, Number, Symbol"
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <UserPlus size={20} />}
          Register Identity
        </button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={() => onNavigate('login')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          Already have an account? Login
        </button>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;