/**
 * Test script to demonstrate LLM provider fallback functionality
 */

import { LLMProviderManager } from './llm-provider-manager';
import { LLMProvider } from '@/types/config';

// Sample providers for testing
const testProviders: LLMProvider[] = [
  {
    id: 'openai-1',
    name: 'OpenAI Primary',
    enabled: true,
    priority: 1,
    apiKey: 'sk-test-key-1',
    model: 'gpt-4',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30,
    retryAttempts: 2,
    fallbackEnabled: true,
  },
  {
    id: 'openai-2',
    name: 'OpenAI Fallback',
    enabled: true,
    priority: 2,
    apiKey: 'sk-test-key-2',
    model: 'gpt-3.5-turbo',
    maxTokens: 2048,
    temperature: 0.7,
    timeout: 30,
    retryAttempts: 1,
    fallbackEnabled: true,
  },
  {
    id: 'gemini-1',
    name: 'Google Gemini',
    enabled: true,
    priority: 3,
    apiKey: 'gemini-test-key',
    model: 'gemini-pro',
    maxTokens: 3072,
    temperature: 0.7,
    timeout: 45,
    retryAttempts: 2,
    fallbackEnabled: true,
  },
  {
    id: 'disabled-provider',
    name: 'Disabled Provider',
    enabled: false,
    priority: 4,
    apiKey: 'disabled-key',
    model: 'disabled-model',
    maxTokens: 1024,
    temperature: 0.5,
    timeout: 30,
    retryAttempts: 1,
    fallbackEnabled: true,
  }
];

export async function testFallbackFunctionality() {
  console.log('🧪 Testing LLM Provider Fallback Functionality\n');

  const manager = new LLMProviderManager(testProviders);

  // Display provider statistics
  const stats = manager.getProviderStats();
  console.log('📊 Provider Statistics:');
  console.log(`   Total providers: ${stats.total}`);
  console.log(`   Enabled providers: ${stats.enabled}`);
  console.log(`   Fallback providers: ${stats.fallback}`);
  console.log(`   Primary provider: ${stats.primary}`);
  console.log(`   Fallback providers: ${stats.fallbackProviders.join(', ')}\n`);

  // Test request
  const testRequest = {
    prompt: 'Hello, how are you today?',
    maxTokens: 100,
    temperature: 0.7
  };

  console.log('🚀 Testing LLM Request with Fallback:');
  console.log(`   Prompt: "${testRequest.prompt}"\n`);

  try {
    const response = await manager.executeRequest(testRequest);

    console.log('✅ Response received:');
    console.log(`   Provider: ${response.provider}`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Success: ${response.success}`);
    console.log(`   Tokens used: ${response.tokensUsed}`);
    console.log(`   Content: ${response.content}`);

    if (response.error) {
      console.log(`   Error: ${response.error}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  // Test validation
  console.log('\n🔍 Testing Provider Validation:');
  testProviders.forEach(provider => {
    const errors = manager.validateProvider(provider);
    if (errors.length > 0) {
      console.log(`   ${provider.name}: ${errors.join(', ')}`);
    } else {
      console.log(`   ${provider.name}: ✅ Valid`);
    }
  });

  // Test duplicate priorities
  const duplicatePriorities = manager.getDuplicatePriorities();
  if (duplicatePriorities.length > 0) {
    console.log(`\n⚠️  Duplicate priorities found: ${duplicatePriorities.join(', ')}`);
  } else {
    console.log('\n✅ No duplicate priorities found');
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testFallbackFunctionality().catch(console.error);
}
