"use client";

// Shared by GameDaySoftPrompt.tsx (and any future bell-icon panel) — mirrors
// hackthedeal.com's subscribeToPush helper, adapted for a multi-tenant
// backend: the brand slug has to travel with every call so the server
// knows which brand's subscriber list a given browser belongs to (see
// backend/app/routers/push.py's resolve_brand-scoped /api/push/subscribe).

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const PUSH_SUBSCRIBED_EVENT = "fyi:push-subscribed";

export function pushSoftDismissKey(brandSlug: string): string {
  return `push_soft_dismissed_at_${brandSlug}`;
}

// How long to hold off re-showing the soft prompt after someone dismisses
// it without deciding — unlike a real permission denial, a dismiss isn't
// final, so it's worth asking again on a later visit.
export const PUSH_SOFT_DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

// Typed as Uint8Array<ArrayBuffer> explicitly — TS's DOM lib now
// distinguishes that from the more general Uint8Array<ArrayBufferLike>,
// and PushSubscriptionOptionsInit.applicationServerKey only accepts the
// former.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export async function subscribeToPush(brandSlug: string) {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const keyRes = await fetch(`${API_URL}/api/push/public-key`);
  if (!keyRes.ok) throw new Error("Notifications aren't set up on the server yet.");
  const { publicKey } = await keyRes.json();

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await fetch(`${API_URL}/api/push/subscribe?brand=${brandSlug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.toJSON().keys }),
  });

  window.dispatchEvent(new CustomEvent(PUSH_SUBSCRIBED_EVENT));
  return sub;
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;

  await fetch(`${API_URL}/api/push/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
  return true;
}
