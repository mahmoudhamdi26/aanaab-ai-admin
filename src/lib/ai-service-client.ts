/**
 * Client for communicating with the main Aanaab AI service
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY;

export class AIServiceClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = AI_SERVICE_URL;
    this.apiKey = AI_SERVICE_API_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`AI Service request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getConfig() {
    return this.makeRequest('/api/v1/config');
  }

  async updateConfig(section: string, config: any) {
    return this.makeRequest(`/api/v1/config/${section}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getSyncJobs() {
    return this.makeRequest('/api/v1/sync/jobs');
  }

  async startSync(syncType: string, config: any) {
    return this.makeRequest('/api/v1/sync/start', {
      method: 'POST',
      body: JSON.stringify({
        sync_type: syncType,
        config,
      }),
    });
  }

  async getSystemHealth() {
    return this.makeRequest('/health');
  }
}

export const aiServiceClient = new AIServiceClient();
