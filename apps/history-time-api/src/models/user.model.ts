import { User as PlatformUser } from '@platform/auth-backend';
import mongoose from 'mongoose';

// For now, just re-export the platform user
// TODO: Add game-specific fields when mongoose versions are aligned
const User = PlatformUser;

export default User;