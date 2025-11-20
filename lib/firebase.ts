import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { appConfig } from "./app-config";

const firebaseApp = getApps().length ? getApp() : initializeApp(appConfig.firebase);

export const auth = getAuth(firebaseApp);


