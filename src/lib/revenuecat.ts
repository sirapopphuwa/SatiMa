// RevenueCat integration — structure prepared for future implementation
// Install: npx expo install react-native-purchases

export const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS ?? '';
export const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID ?? '';

export const ENTITLEMENTS = {
  PREMIUM: 'premium',
} as const;

export const OFFERINGS = {
  DEFAULT: 'default',
} as const;

// ฟังก์ชันเหล่านี้จะถูก implement เมื่อ react-native-purchases ถูกติดตั้ง
export async function initRevenueCat(_userId: string): Promise<void> {
  // TODO: Purchases.configure({ apiKey: RC_API_KEY_IOS });
  // TODO: Purchases.logIn(userId);
}

export async function checkPremiumStatus(): Promise<boolean> {
  // TODO: const info = await Purchases.getCustomerInfo();
  // TODO: return info.entitlements.active[ENTITLEMENTS.PREMIUM] != null;
  return false;
}

export async function purchasePremium(): Promise<boolean> {
  // TODO: const offerings = await Purchases.getOfferings();
  // TODO: purchase flow
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  // TODO: await Purchases.restorePurchases();
  return false;
}
