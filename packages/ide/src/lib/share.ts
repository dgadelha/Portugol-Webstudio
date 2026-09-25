import { FIREBASE_CONFIG } from "@/config/env";

/**
 * O Firebase só é baixado quando alguém compartilha ou abre um código compartilhado.
 */
async function getShareStorage() {
  const [{ initializeApp, getApps }, storage] = await Promise.all([import("firebase/app"), import("firebase/storage")]);
  const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);

  return { storage, instance: storage.getStorage(app) };
}

const SHARE_HASH_PREFIX = "#share=";

export function getSharedCodeIdFromHash(hash = window.location.hash) {
  return hash.startsWith(SHARE_HASH_PREFIX) ? hash.slice(SHARE_HASH_PREFIX.length) : null;
}

export async function shareCode(code: string): Promise<string | null> {
  const shareId = (Math.random() + 1).toString(36).slice(2, 9);

  try {
    const { storage, instance } = await getShareStorage();

    await storage.uploadString(storage.ref(instance, `share/${shareId}.por`), code, undefined, {
      contentType: "text/plain",
    });

    return `https://portugol.dev/${SHARE_HASH_PREFIX}${shareId}`;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function loadSharedCode(shareId: string): Promise<string | null> {
  try {
    const { storage, instance } = await getShareStorage();
    const blob = await storage.getBlob(storage.ref(instance, `share/${shareId}.por`));

    return await blob.text();
  } catch (error) {
    console.error(error);
    return null;
  }
}
