export interface UsageRecord {
  id: string;
  userId?: string;
  projectId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
  latencyMs: number;
  timestamp: string;
}

export interface AggregateUsageStats {
  totalCalls: number;
  totalTokens: number;
  totalCostUSD: number;
  providerBreakdown: Record<string, { calls: number; costUSD: number; tokens: number }>;
}

const LOCAL_STORAGE_USAGE_KEY = 'promptexa_usage_events';

export class UsageTracker {
  private static inMemoryStore: UsageRecord[] = [];

  private static getStore(): UsageRecord[] {
    if (typeof window === 'undefined') {
      return this.inMemoryStore;
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_USAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static record(entry: Omit<UsageRecord, 'id' | 'timestamp'>): UsageRecord {
    const records = this.getStore();
    const newRecord: UsageRecord = {
      id: 'usg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      ...entry,
      timestamp: new Date().toISOString(),
    };

    records.unshift(newRecord);
    // Keep last 200 records locally
    if (records.length > 200) {
      records.length = 200;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USAGE_KEY, JSON.stringify(records));
    } else {
      this.inMemoryStore = records;
    }
    return newRecord;
  }

  static clear(): void {
    this.inMemoryStore = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_USAGE_KEY);
    }
  }

  static getStats(projectId?: string): AggregateUsageStats {
    let records = this.getStore();
    if (projectId) {
      records = records.filter(r => r.projectId === projectId);
    }

    let totalTokens = 0;
    let totalCostUSD = 0;
    const providerBreakdown: Record<string, { calls: number; costUSD: number; tokens: number }> = {};

    for (const r of records) {
      totalTokens += r.totalTokens;
      totalCostUSD += r.estimatedCostUSD;

      if (!providerBreakdown[r.provider]) {
        providerBreakdown[r.provider] = { calls: 0, costUSD: 0, tokens: 0 };
      }
      providerBreakdown[r.provider].calls += 1;
      providerBreakdown[r.provider].tokens += r.totalTokens;
      providerBreakdown[r.provider].costUSD = Number((providerBreakdown[r.provider].costUSD + r.estimatedCostUSD).toFixed(6));
    }

    return {
      totalCalls: records.length,
      totalTokens,
      totalCostUSD: Number(totalCostUSD.toFixed(6)),
      providerBreakdown,
    };
  }
}
