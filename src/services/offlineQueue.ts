import type { EmergencyAlert } from "../types/emergency";

const DB_NAME = "sase-offline";
const DB_VERSION = 1;
const ALERT_STORE = "alerts";

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openEmergencyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB no disponible"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ALERT_STORE)) {
        db.createObjectStore(ALERT_STORE, { keyPath: "id" });
      }
    };

    request.onerror = () => reject(request.error || new Error("No se pudo abrir la cola offline"));
    request.onsuccess = () => resolve(request.result);
  });
}

function runStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  return openEmergencyDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(ALERT_STORE, mode);
        const store = tx.objectStore(ALERT_STORE);
        const request = action(store);

        request.onerror = () => reject(request.error || new Error("Error en cola offline"));
        request.onsuccess = () => resolve(request.result);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error || new Error("Transaccion offline fallida"));
      }),
  );
}

export async function saveOfflineAlert(alerta: EmergencyAlert) {
  await runStore("readwrite", (store) => store.put(alerta));
}

export async function deleteOfflineAlert(alertaId: string) {
  await runStore("readwrite", (store) => store.delete(alertaId));
}

export async function getOfflineAlerts() {
  return runStore<EmergencyAlert[]>("readonly", (store) => store.getAll());
}

export async function syncOfflineAlerts(sendAlert: (alerta: EmergencyAlert) => Promise<boolean>) {
  const alerts = await getOfflineAlerts();
  let sent = 0;

  for (const alerta of alerts) {
    const ok = await sendAlert(alerta);
    if (ok) {
      await deleteOfflineAlert(alerta.id);
      sent += 1;
    }
  }

  return sent;
}
