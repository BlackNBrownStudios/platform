/**
 * Adapter for the shared profile hook
 * This ensures consistent profile management between web and mobile
 */
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { useProfile, ExtendedUser } from '../../../../shared/src/hooks/useProfile';
import { UserStats } from '../../../../shared/src/types';
import { useSharedAdapter } from '../services/sharedAdapter';

/**
 * Mobile-specific implementation of the shared profile hook
 */
export function useSharedProfile() {
  // Get our shared adapter
  const adapter = useSharedAdapter();

  // Create the API object expected by the shared hook
  const profileApi = {
    getUserProfile: async () => {
      const userData = await adapter.getUserProfile();
      return userData as ExtendedUser;
    },

    updateUserProfile: async (data: Partial<ExtendedUser>) => {
      const updatedData = await adapter.updateUserProfile(data);
      return updatedData as ExtendedUser;
    },

    // Mobile implementation of profile picture upload using expo-image-picker
    uploadProfilePicture: async (file: string | File | Blob) => {
      // For mobile, we expect a string URI
      try {
        const url = await adapter.uploadProfilePicture(typeof file === 'string' ? file : '');
        return { url };
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
      }
    },
  };

  // Use the shared hook with our mobile-specific API implementation
  const [profileState, profileActions] = useProfile({ api: profileApi });

  // Extend the hook with mobile-specific functionality
  return {
    ...profileState,
    ...profileActions,
    pickProfileImage,
  };
}

/**
 * Helper function to pick an image from the device gallery
 */
async function pickProfileImage(): Promise<string | null> {
  // Request permission to access the photo library
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    console.error('Permission to access media library was denied');
    return null;
  }

  // Launch the image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) {
    return null;
  }

  // Return the URI of the selected image
  return result.assets?.[0]?.uri || null;
}

export default useSharedProfile;
