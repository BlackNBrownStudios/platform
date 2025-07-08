'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSharedProfile } from '../../hooks/useSharedProfile';
// import { validateField, validateEmail } from '@history-time/auth';
// Temporarily comment out during migration

// Temporary validation functions
const validateField = (
  value: string,
  fieldName: string,
  required: boolean,
  minLength?: number
): string | null => {
  if (required && !value) {
    return `${fieldName} is required`;
  }
  if (minLength && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Profile Form Component
 * Handles user profile information editing and profile picture upload
 * Uses shared hooks and validation for consistency with mobile
 */
export default function ProfileForm() {
  const { profile, loading, updating, error, updateProfile, uploadPicture } = useSharedProfile();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    preferredCategory: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Categories for selection
  const categories = ['History', 'Science', 'Art', 'Geography', 'Technology', 'Literature'];

  // Profile loading temporarily disabled during migration

  // Profile data sync temporarily disabled during migration

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear success message when form is edited
    if (successMessage) {
      setSuccessMessage('');
    }

    // Clear field error when edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Use shared validation functions for consistent validation rules
    const nameError = validateField(formData.name, 'Name', true, 2);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (!emailError) errors.email = 'Please enter a valid email address';

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Upload image if selected
      if (imageFile && uploadPicture) {
        await uploadPicture(imageFile);
      }

      // Update profile information
      await updateProfile({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        preferredCategory: formData.preferredCategory || undefined,
      });

      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (loading && !profile) {
    return <div className="flex justify-center py-8">Loading profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200">
          {previewUrl ? (
            <Image src={previewUrl} alt="Profile picture" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer transition">
          Upload New Picture
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.bio ? `${formData.bio.length}/500` : '0/500'} characters
        </p>
        {formErrors.bio && <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>}
      </div>

      {/* Preferred Category */}
      <div>
        <label htmlFor="preferredCategory" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Category
        </label>
        <select
          id="preferredCategory"
          name="preferredCategory"
          value={formData.preferredCategory}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
