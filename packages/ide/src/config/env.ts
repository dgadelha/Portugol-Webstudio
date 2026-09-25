/**
 * Só o domínio de produção é a versão estável: o beta e o ambiente local se identificam como beta.
 */
export const IS_BETA = window.location.hostname !== "portugol.dev";

export const IS_PRODUCTION = import.meta.env.PROD;

export const BUILD_INFO = {
  commit: import.meta.env.VITE_COMMIT_SHA ?? "dev",
  date: import.meta.env.VITE_BUILD_DATE ?? "",
  sentryRelease: import.meta.env.VITE_SENTRY_RELEASE,
};

export const SENTRY_DSN = "https://620518162f784d2aa3e3ee7223d08594@o1070945.ingest.sentry.io/6067438";

export const GOOGLE_ANALYTICS_ID = "G-ZKM28VG4G5";

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD_6fjI7Vsm4RQS6EJZSZ_an7Zehjz9YwQ",
  authDomain: "portugol-webstudio.firebaseapp.com",
  projectId: "portugol-webstudio",
  storageBucket: "portugol-webstudio.appspot.com",
  messagingSenderId: "845512624544",
  appId: "1:845512624544:web:b1d4787cafd265429dfcc5",
  measurementId: "G-BM3QGZS096",
};

export const LINKS = {
  repository: "https://github.com/dgadelha/Portugol-Webstudio",
  suggestions: "https://github.com/dgadelha/Portugol-Webstudio/discussions/categories/ideias-e-sugest%C3%B5es",
  questions: "https://github.com/dgadelha/Portugol-Webstudio/discussions/categories/d%C3%BAvidas-perguntas",
  reportBug: "https://github.com/dgadelha/Portugol-Webstudio/issues/new?template=bug.yml",
  newIssue: "https://github.com/dgadelha/Portugol-Webstudio/issues/new/choose",
  stable: "https://portugol.dev/",
  beta: "https://beta.portugol.dev/",
};
