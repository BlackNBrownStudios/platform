// This polyfill helps ensure uuid works in both React Native and Web environments
import * as uuid from 'uuid';

// Create a wrapper around uuid functionality to make it work consistently
const uuidWrapper = {
  v4: () => {
    // If we're in a web environment, handle potential Buffer issues
    try {
      return uuid.v4();
    } catch (error) {
      // Fallback implementation for web environments where uuid fails
      // This is a simple random UUID generator that's good enough for most use cases
      // but not as robust as the full uuid implementation
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  },
};

export default uuidWrapper;
