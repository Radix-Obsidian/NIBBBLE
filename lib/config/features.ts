// File: lib/config/features.ts

export const FEATURES = {
  enableNibbleCollections: process.env.NEXT_PUBLIC_ENABLE_NIBBLE_COLLECTIONS === 'true' || false,
  enableSocialFeatures: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES === 'true' || false,
  enableCollaborativeBoards: process.env.NEXT_PUBLIC_ENABLE_COLLABORATIVE_BOARDS === 'true' || false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
