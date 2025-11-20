import Constants from "expo-constants";
import type { FirebaseOptions } from "firebase/app";

type GoogleAuthConfig = {
  expoClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
};

type ExtraConfig = {
  firebase: FirebaseOptions;
  googleAuth?: GoogleAuthConfig;
};

function resolveExtraConfig(): ExtraConfig {
  const extraFromExpo = Constants.expoConfig?.extra as ExtraConfig | undefined;
  const extraFromManifest = (Constants.manifest as { extra?: ExtraConfig } | null)?.extra;
  const extra = extraFromExpo ?? extraFromManifest;

  if (!extra?.firebase) {
    throw new Error("Firebase config is not defined under expo.extra.firebase");
  }

  return extra;
}

export const appConfig = resolveExtraConfig();
export type { GoogleAuthConfig };


