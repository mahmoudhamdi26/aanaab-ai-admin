/**
 * LLM Provider Manager
 * Handles provider selection, fallback logic, and error handling
 */

import { LLMProvider } from '@/types/config';

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  success: boolean;
  error?: string;
}

export class LLMProviderManager {
  private providers: LLMProvider[];

  constructor(providers: LLMProvider[]) {
    this.providers = providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get the primary provider (highest priority, enabled)
   */
  getPrimaryProvider(): LLMProvider | null {
    return this.providers.find(p => p.enabled) || null;
  }

  /**
   * Get all fallback providers (enabled, fallback enabled, sorted by priority)
   */
  getFallbackProviders(): LLMProvider[] {
    return this.providers
      .filter(p => p.enabled && p.fallbackEnabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all available providers (enabled, sorted by priority)
   */
  getAvailableProviders(): LLMProvider[] {
    return this.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute LLM request with fallback support
   */
  async executeRequest(request: LLMRequest): Promise<LLMResponse> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      return {
        content: '',
        provider: 'none',
        model: 'none',
        tokensUsed: 0,
        success: false,
        error: 'No enabled providers available'
      };
    }

    // Try each provider in priority order
    for (const provider of availableProviders) {
      try {
        const response = await this.callProvider(provider, request);
        return {
          ...response,
          success: true
        };
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);

        // If this is the last provider, return the error
        if (provider === availableProviders[availableProviders.length - 1]) {
          return {
            content: '',
            provider: provider.name,
            model: provider.model,
            tokensUsed: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

        // Otherwise, continue to next provider
        continue;
      }
    }

    // This should never be reached, but just in case
    return {
      content: '',
      provider: 'none',
      model: 'none',
      tokensUsed: 0,
      success: false,
      error: 'All providers failed'
    };
  }

  /**
   * Call a specific provider
   */
  private async callProvider(provider: LLMProvider, request: LLMRequest): Promise<Omit<LLMResponse, 'success'>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), provider.timeout * 1000);

    try {
      // This is a placeholder - in a real implementation, you would call the actual API
      const response = await this.mockProviderCall(provider, request, controller.signal);

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Mock provider call - replace with actual API calls
   */
  private async mockProviderCall(
    provider: LLMProvider,
    request: LLMRequest,
    signal: AbortSignal
  ): Promise<Omit<LLMResponse, 'success'>> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error(`Provider ${provider.name} is temporarily unavailable`);
    }

    return {
      content: `Response from ${provider.name} (${provider.model}): ${request.prompt}`,
      provider: provider.name,
      model: provider.model,
      tokensUsed: Math.floor(Math.random() * 100) + 50
    };
  }

  /**
   * Get provider statistics
   */
  getProviderStats() {
    const enabled = this.providers.filter(p => p.enabled);
    const fallback = this.providers.filter(p => p.enabled && p.fallbackEnabled);

    return {
      total: this.providers.length,
      enabled: enabled.length,
      fallback: fallback.length,
      primary: enabled[0]?.name || 'None',
      fallbackProviders: fallback.map(p => p.name)
    };
  }

  /**
   * Validate provider configuration
   */
  validateProvider(provider: LLMProvider): string[] {
    const errors: string[] = [];

    if (!provider.name.trim()) {
      errors.push('Provider name is required');
    }

    if (!provider.apiKey.trim()) {
      errors.push('API key is required');
    }

    if (!provider.model.trim()) {
      errors.push('Model is required');
    }

    if (provider.priority < 1) {
      errors.push('Priority must be at least 1');
    }

    if (provider.maxTokens < 1) {
      errors.push('Max tokens must be at least 1');
    }

    if (provider.temperature < 0 || provider.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (provider.timeout < 5) {
      errors.push('Timeout must be at least 5 seconds');
    }

    if (provider.retryAttempts < 0 || provider.retryAttempts > 5) {
      errors.push('Retry attempts must be between 0 and 5');
    }

    return errors;
  }

  /**
   * Check for duplicate priorities
   */
  getDuplicatePriorities(): number[] {
    const priorities = this.providers.map(p => p.priority);
    const duplicates = priorities.filter((priority, index) =>
      priorities.indexOf(priority) !== index
    );
    return [...new Set(duplicates)];
  }
}
