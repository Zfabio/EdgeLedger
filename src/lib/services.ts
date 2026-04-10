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

// Helper to fetch the gist data
const fetchGist = async (token: string, gistId: string) => {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch Gist");
  return res.json();
};

export const getAssetRecords = async (token: string, gistId: string): Promise<AssetRecord[]> => {
  try {
    const gist = await fetchGist(token, gistId);
    const file = gist.files["fintrack.json"];
    if (!file || !file.content) return [];
    
    const records: AssetRecord[] = JSON.parse(file.content);
    return records.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  } catch (error) {
    console.error("Error reading from Gist", error);
    return [];
  }
};

export const addAssetRecord = async (token: string, gistId: string, record: Omit<AssetRecord, "id" | "total">) => {
  // 1. Fetch current records
  const currentRecords = await getAssetRecords(token, gistId);
  
  // 2. Add the new record with an ID and derived total
  const newRecord: AssetRecord = {
    ...record,
    id: crypto.randomUUID(),
    total: record.stocks + record.crypto + record.cash + record.realEstate + record.other,
  };
  
  const updatedRecords = [...currentRecords, newRecord];
  
  // 3. Update the gist
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      files: {
        "fintrack.json": {
          content: JSON.stringify(updatedRecords, null, 2)
        }
      }
    })
  });
  
  if (!res.ok) throw new Error("Failed to save to Gist");
  return newRecord;
};

// Validates the keys are actually working and the connection exists
export const validateConnection = async (token: string, gistId: string) => {
  try {
    const gist = await fetchGist(token, gistId);
    // If the file doesn't exist yet, we initialize it!
    if (!gist.files["fintrack.json"]) {
       await fetch(`https://api.github.com/gists/${gistId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          files: {
            "fintrack.json": {
              content: "[]"
            }
          }
        })
      });
    }
    return true;
  } catch (error) {
    throw new Error("Invalid Token or Gist ID");
  }
};
