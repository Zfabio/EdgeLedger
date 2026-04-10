export interface AssetRecord {
  id?: string;
  month: string; // YYYY-MM
  values: Record<string, number>; // { "Stocks": 1000, "Crypto": 500, ... }
  total?: number;
}

const STORAGE_KEY = "edgeledger_records";

export const getAssetRecords = (): AssetRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const records: AssetRecord[] = JSON.parse(raw);
    return records.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  } catch {
    return [];
  }
};

export const addAssetRecord = (month: string, values: Record<string, number>): AssetRecord => {
  const existing = getAssetRecords();
  const total = Object.values(values).reduce((sum, v) => sum + v, 0);
  const newRecord: AssetRecord = { id: crypto.randomUUID(), month, values, total };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newRecord]));
  return newRecord;
};

export const deleteAssetRecord = (id: string): void => {
  const existing = getAssetRecords();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(r => r.id !== id)));
};

export const updateAssetRecord = (id: string, month: string, values: Record<string, number>): void => {
  const existing = getAssetRecords();
  const total = Object.values(values).reduce((sum, v) => sum + v, 0);
  const updated = existing.map(r => r.id === id ? { ...r, month, values, total } : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
