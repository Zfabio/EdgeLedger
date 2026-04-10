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

// Helper: calls our own server-side proxy instead of GitHub directly
const callGistProxy = async (token: string, gistId: string, method = "GET", body?: object) => {
  const res = await fetch(`/api/gist?gistId=${gistId}`, {
    method,
    headers: {
      "x-github-token": token,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error || "Unknown error";
    throw new Error(`GitHub API Error (${res.status}): ${msg}`);
  }

  return data;
};

export const getAssetRecords = async (token: string, gistId: string): Promise<AssetRecord[]> => {
  const gist = await callGistProxy(token, gistId);
  const file = gist.files?.["fintrack.json"];
  if (!file || !file.content) return [];
  const records: AssetRecord[] = JSON.parse(file.content);
  return records.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

export const addAssetRecord = async (token: string, gistId: string, record: Omit<AssetRecord, "id" | "total">) => {
  const currentRecords = await getAssetRecords(token, gistId);
  const newRecord: AssetRecord = {
    ...record,
    id: crypto.randomUUID(),
    total: record.stocks + record.crypto + record.cash + record.realEstate + record.other,
  };
  const updatedRecords = [...currentRecords, newRecord];
  await callGistProxy(token, gistId, "PATCH", {
    files: { "fintrack.json": { content: JSON.stringify(updatedRecords, null, 2) } },
  });
  return newRecord;
};

// Validates connection - now throws a specific error message from GitHub
export const validateConnection = async (token: string, gistId: string) => {
  const gist = await callGistProxy(token, gistId); // throws with GitHub's real error if invalid
  if (!gist.files?.["fintrack.json"]) {
    await callGistProxy(token, gistId, "PATCH", {
      files: { "fintrack.json": { content: "[]" } },
    });
  }
  return true;
};
