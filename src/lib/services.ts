import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, where } from "firebase/firestore";

export interface AssetRecord {
  id?: string;
  userId: string;
  month: string; // YYYY-MM
  stocks: number;
  crypto: number;
  cash: number;
  realEstate: number;
  other: number;
  total?: number;
}

const getCollection = (userId: string) => collection(db, "users", userId, "assets");

export const addAssetRecord = async (userId: string, record: Omit<AssetRecord, "id" | "userId" | "total">) => {
  const c = getCollection(userId);
  const total = record.stocks + record.crypto + record.cash + record.realEstate + record.other;
  return await addDoc(c, {
    ...record,
    userId,
    total,
    createdAt: new Date()
  });
};

export const getAssetRecords = async (userId: string): Promise<AssetRecord[]> => {
  const c = getCollection(userId);
  const q = query(c, orderBy("month", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetRecord));
};

export const deleteAssetRecord = async (userId: string, recordId: string) => {
  return await deleteDoc(doc(db, "users", userId, "assets", recordId));
};
