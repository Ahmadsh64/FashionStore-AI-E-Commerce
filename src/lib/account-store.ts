import type { SupabaseClient } from "@supabase/supabase-js";
import { clearTrackedEmail } from "@/components/CartAbandonTracker";
import { createClient } from "@/lib/supabase/client";
import { useCart, type CartItem } from "@/store/cart";
import { useRecent } from "@/store/recent";
import { useWishlist } from "@/store/wishlist";

export type AccountSnapshot = {
  cart: CartItem[];
  wishlist: string[];
  recent: string[];
};

const OWNER_KEY = "fashion-store-account-owner";
const SNAP_PREFIX = "fashion-store-account:";
const GUEST = "guest";

let activeUserId: string | null = null;
let skipSave = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let ready = false;
let activateQueue: Promise<void> = Promise.resolve();

const emptySnapshot = (): AccountSnapshot => ({
  cart: [],
  wishlist: [],
  recent: [],
});

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const price = asNumber(item.price);
  const quantity = asNumber(item.quantity);
  const stock = asNumber(item.stock);
  if (price == null || quantity == null || stock == null) return false;
  if (typeof item.id !== "string" || typeof item.key !== "string") return false;
  if (typeof item.name !== "string" || typeof item.image_url !== "string") return false;
  item.price = price;
  item.quantity = quantity;
  item.stock = stock;
  if (item.size != null && typeof item.size !== "string") delete item.size;
  if (item.color != null && typeof item.color !== "string") delete item.color;
  return true;
}

function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function parseSnapshot(raw: unknown): AccountSnapshot {
  if (!raw || typeof raw !== "object") return emptySnapshot();
  const data = raw as Record<string, unknown>;
  return {
    cart: Array.isArray(data.cart) ? data.cart.filter(isCartItem) : [],
    wishlist: parseIds(data.wishlist),
    recent: parseIds(data.recent),
  };
}

function snapshotHasData(snap: AccountSnapshot) {
  return snap.cart.length > 0 || snap.wishlist.length > 0 || snap.recent.length > 0;
}

export function getAccountSnapshot(): AccountSnapshot {
  return {
    cart: useCart.getState().items,
    wishlist: useWishlist.getState().ids,
    recent: useRecent.getState().ids,
  };
}

export function applyAccountSnapshot(snap: AccountSnapshot) {
  useCart.getState().replaceItems(snap.cart);
  useWishlist.getState().replaceIds(snap.wishlist);
  useRecent.getState().replaceIds(snap.recent);
}

export function clearPersonalStores() {
  applyAccountSnapshot(emptySnapshot());
}

function localKey(owner: string) {
  return `${SNAP_PREFIX}${owner}`;
}

function readOwner(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(OWNER_KEY);
}

function writeOwner(owner: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OWNER_KEY, owner);
}

function saveLocal(owner: string, snap: AccountSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(localKey(owner), JSON.stringify(snap));
}

function loadLocal(owner: string): AccountSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(localKey(owner));
  if (!raw) return null;
  try {
    return parseSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function saveRemote(
  supabase: SupabaseClient,
  userId: string,
  snap: AccountSnapshot,
) {
  const { error } = await supabase.from("user_prefs").upsert(
    {
      user_id: userId,
      cart: snap.cart,
      wishlist: snap.wishlist,
      recent: snap.recent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

async function loadRemote(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountSnapshot | null> {
  const { data, error } = await supabase
    .from("user_prefs")
    .select("cart, wishlist, recent")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return parseSnapshot(data);
}

export async function saveActiveAccount() {
  if (!activeUserId || skipSave) return;
  const snap = getAccountSnapshot();
  saveLocal(activeUserId, snap);
  try {
    await saveRemote(createClient(), activeUserId, snap);
  } catch {
    // local backup is enough if the table is not created yet
  }
}

export function scheduleAccountSave() {
  if (!ready || !activeUserId || skipSave) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveActiveAccount();
  }, 700);
}

async function loadAccount(userId: string): Promise<AccountSnapshot | null> {
  try {
    const remote = await loadRemote(createClient(), userId);
    if (remote) return remote;
  } catch {
    // fall back to this device
  }
  return loadLocal(userId);
}

function waitForPersist<T extends { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }>(
  store: T,
) {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

export async function whenStoresHydrated() {
  await Promise.all([
    waitForPersist(useCart),
    waitForPersist(useWishlist),
    waitForPersist(useRecent),
  ]);
}

/**
 * מעביר את הסל/מועדפים/נצפו לחשבון החדש (או לאורח).
 * שומר קודם את החשבון הקודם כדי שלא יאבד.
 */
export function activateAccount(nextUserId: string | null) {
  activateQueue = activateQueue.then(() => activateAccountInner(nextUserId)).catch(() => {});
  return activateQueue;
}

async function activateAccountInner(nextUserId: string | null) {
  if (activeUserId === nextUserId && ready) return;

  skipSave = true;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  const prev = activeUserId;
  const current = getAccountSnapshot();
  const owner = readOwner();

  if (prev && prev !== nextUserId) {
    saveLocal(prev, current);
    try {
      await saveRemote(createClient(), prev, current);
    } catch {
      // keep local copy
    }
  } else if (!prev && owner && owner !== GUEST && owner !== nextUserId) {
    saveLocal(owner, current);
  } else if (!nextUserId && owner && owner !== GUEST) {
    saveLocal(owner, current);
  } else if (nextUserId && (!owner || owner === GUEST)) {
    saveLocal(GUEST, current);
  }

  if (nextUserId) {
    const account = await loadAccount(nextUserId);
    if (account && snapshotHasData(account)) {
      applyAccountSnapshot(account);
    } else if (!prev && snapshotHasData(current) && (!owner || owner === GUEST || owner === nextUserId)) {
      applyAccountSnapshot(current);
      saveLocal(nextUserId, current);
      try {
        await saveRemote(createClient(), nextUserId, current);
      } catch {
        // local only
      }
    } else {
      applyAccountSnapshot(emptySnapshot());
    }
    writeOwner(nextUserId);
    activeUserId = nextUserId;
  } else {
    applyAccountSnapshot(emptySnapshot());
    writeOwner(GUEST);
    activeUserId = null;
  }

  skipSave = false;
  ready = true;
}

export async function logoutAndFlush() {
  skipSave = true;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (activeUserId) {
    const snap = getAccountSnapshot();
    saveLocal(activeUserId, snap);
    try {
      await saveRemote(createClient(), activeUserId, snap);
    } catch {
      // local backup
    }
  }
  applyAccountSnapshot(emptySnapshot());
  clearTrackedEmail();
  writeOwner(GUEST);
  activeUserId = null;
  ready = true;
  const supabase = createClient();
  await supabase.auth.signOut();
  skipSave = false;
}

export function getActiveAccountId() {
  return activeUserId;
}

export function isAccountSyncReady() {
  return ready;
}
