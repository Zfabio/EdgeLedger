export interface AssetRecord {
  id?: string;
  month: string; // YYYY-MM
  stocks: number;
  crypto: number;
  cash: number;
  realEstate: number;
  other: number;
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

export const addAssetRecord = (record: Omit<AssetRecord, "id" | "total">): AssetRecord => {
  const existing = getAssetRecords();
  const newRecord: AssetRecord = {
    ...record,
    id: crypto.randomUUID(),
    total: record.stocks + record.crypto + record.cash + record.realEstate + record.other,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newRecord]));
  return newRecord;
};

export const deleteAssetRecord = (id: string): void => {
  const existing = getAssetRecords();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(r => r.id !== id)));
};
