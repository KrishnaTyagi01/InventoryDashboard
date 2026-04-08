export interface FeatureFlags {
  enableAnalyticsView: boolean;
  enableBulkActions: boolean;
  enableOrderExport: boolean;
}

const defaultFlags: FeatureFlags = {
  enableAnalyticsView: true,
  enableBulkActions: true,
  enableOrderExport: true,
};

const envFlags: Partial<FeatureFlags> = import.meta.env.VITE_FEATURE_FLAGS
  ? JSON.parse(import.meta.env.VITE_FEATURE_FLAGS)
  : {};

export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...envFlags,
};

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

export function getFeatureFlags(): FeatureFlags {
  return { ...featureFlags };
}