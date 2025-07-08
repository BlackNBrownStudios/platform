'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

const LoginPage = () => {
  const router = useRouter();
  const { login, error: authError, loading } = useUnifiedAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Clear form error when inputs change
  useEffect(() => {
    if (formError) {
      setFormError('');
    }
  }, [email, password, formError]);

  // Check for stored email if user previously used "Remember me"
  useEffect(() => {
    const storedEmail = localStorage.getItem('history_time_remember_email');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    // Reset error state
    setFormError('');

    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setFormError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);

      // Store email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('history_time_remember_email', email);
      } else {
        localStorage.removeItem('history_time_remember_email');
      }

      setLoginSuccess(true);

      // Short delay before redirect to show success message
      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err) {
      setFormError('Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Log In to History Time</h1>

      {loginSuccess && (
        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 p-3 rounded mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Login successful! Redirecting...</span>
        </div>
      )}

      {(formError || authError) && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-3 rounded mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formError || authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isSubmitting || loginSuccess}
            data-testid="email-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isSubmitting || loginSuccess}
            data-testid="password-input"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting || loginSuccess}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loginSuccess}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
            isSubmitting || loading || loginSuccess
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
          data-testid="login-button"
        >
          {isSubmitting || loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </span>
          ) : loginSuccess ? (
            'Success!'
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
            Register
          </Link>
        </p>
        <p>
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Forgot Password?
          </Link>
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
            data-testid="guest-button"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
