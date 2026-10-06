import { UserInfo, InvestigationResponse, AuditEvent } from '../types';

const API_BASE = '/api/v1';

export class ApiService {
  private static token: string | null = localStorage.getItem('sre_token');

  public static setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('sre_token', token);
    } else {
      localStorage.removeItem('sre_token');
    }
  }

  public static getToken(): string | null {
    return this.token;
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  public static async login(username: string, password: string): Promise<UserInfo> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Authentication failed');
    }
    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  public static async checkHealth(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  public static async investigate(
    question: string,
    serviceName?: string,
    forceRefresh: boolean = false
  ): Promise<InvestigationResponse> {
    const res = await fetch(`${API_BASE}/investigate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        question,
        service_name: serviceName && serviceName !== 'All Services' ? serviceName : undefined,
        force_refresh: forceRefresh,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Investigation failed' }));
      throw new Error(err.detail || 'Investigation failed');
    }
    return res.json();
  }

  public static async getAuditEvents(limit: number = 20): Promise<AuditEvent[]> {
    const res = await fetch(`${API_BASE}/audit/events?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch audit records' }));
      throw new Error(err.detail || 'Failed to fetch audit records');
    }
    return res.json();
  }
}
