import { NextRequest, NextResponse } from 'next/server';

// Pricing configuration (per 1K tokens)
const PRICING_CONFIG = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'auto': { input: 0.005, output: 0.015 } // Default to GPT-4o pricing
};

const calculateCost = (model: string, inputTokens: number, outputTokens: number): number => {
  const pricing = PRICING_CONFIG[model as keyof typeof PRICING_CONFIG] || PRICING_CONFIG.auto;
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
};

const getModelFromProvider = (provider: string, model: string): string => {
  if (model === 'auto') {
    return provider === 'openai' ? 'gpt-4o-mini' :
      provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini';
  }
  return model;
};

// Improved token estimation (more accurate approximation)
const estimateTokens = (text: string): number => {
  if (!text || text.length === 0) return 0;

  // More accurate estimation based on OpenAI's tokenizer behavior
  // - English text: ~4 characters per token
  // - Code: ~3 characters per token  
  // - Mixed content: ~3.5 characters per token
  // - Arabic text: ~2.5 characters per token

  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasCode = /[{}();=<>[\]]/.test(text);

  let charsPerToken = 4; // Default for English

  if (hasArabic && hasCode) {
    charsPerToken = 2.8; // Mixed Arabic and code
  } else if (hasArabic) {
    charsPerToken = 2.5; // Arabic text
  } else if (hasCode) {
    charsPerToken = 3.2; // Code
  }

  return Math.ceil(text.length / charsPerToken);
};

// Extract tokens from various possible API response formats
const extractTokensFromResponse = (data: any, userMessage: string, assistantResponse: string) => {
  // Try different possible field names from the API response
  // Priority: new unified format, then legacy formats
  const inputTokens = data.tokens_input ||
    data.input_tokens ||
    data.prompt_tokens ||
    data.tokens_prompt ||
    data.usage?.prompt_tokens ||
    data.usage?.input_tokens ||
    data.token_usage?.input_tokens ||
    data.token_usage?.prompt_tokens ||
    0;

  const outputTokens = data.tokens_output ||
    data.output_tokens ||
    data.completion_tokens ||
    data.tokens_completion ||
    data.usage?.completion_tokens ||
    data.usage?.output_tokens ||
    data.token_usage?.output_tokens ||
    data.token_usage?.completion_tokens ||
    0;

  const totalTokens = data.tokens_used ||
    data.total_tokens ||
    data.tokens_total ||
    data.usage?.total_tokens ||
    data.token_usage?.total_tokens ||
    (inputTokens + outputTokens) ||
    0;

  // If we have both input and output tokens, use them directly
  if (inputTokens > 0 && outputTokens > 0) {
    return {
      inputTokens,
      outputTokens,
      totalTokens: totalTokens || (inputTokens + outputTokens)
    };
  }

  // If we still don't have token breakdown, estimate it
  if (inputTokens === 0 && outputTokens === 0 && totalTokens > 0) {
    // If we have total tokens but no breakdown, estimate based on content length
    const userTokens = estimateTokens(userMessage);
    const assistantTokens = estimateTokens(assistantResponse);
    const estimatedTotal = userTokens + assistantTokens;

    // Use the actual total if available, otherwise use our estimate
    const actualTotal = totalTokens > 0 ? totalTokens : estimatedTotal;

    // For chat responses, estimate input/output split based on content
    // User message is input, assistant response is output
    const estimatedInput = Math.min(userTokens, actualTotal);
    const estimatedOutput = Math.max(0, actualTotal - estimatedInput);

    return {
      inputTokens: estimatedInput,
      outputTokens: estimatedOutput,
      totalTokens: actualTotal
    };
  }

  // If we have no tokens at all, estimate from content
  if (totalTokens === 0) {
    const userTokens = estimateTokens(userMessage);
    const assistantTokens = estimateTokens(assistantResponse);
    const estimatedTotal = userTokens + assistantTokens;

    return {
      inputTokens: userTokens,
      outputTokens: assistantTokens,
      totalTokens: estimatedTotal
    };
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      courseId,
      testType,
      baseUrl,
      modelProvider,
      model,
      temperature,
      maxTokens
    } = body;

    // Get the bearer token from the Authorization header
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '') || '';

    // For local testing, allow empty bearer token with a warning
    if (!bearerToken || bearerToken === 'your-bearer-token-here') {
      console.log('⚠️  No valid bearer token provided - attempting real API call with localhost');

      // Try to make real API calls to localhost for development
      try {
        // Try localhost first, then fallback to host.docker.internal for Docker
        let apiUrl = `${baseUrl.replace('localhost', '127.0.0.1')}/api/v1/${testType === 'chat' ? 'chat/' : 'langgraph/chat'}`;
        console.log(`Making API call to: ${apiUrl}`);

        let localResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Host': 'localhost:8000',
            'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItUU1pSGRBSEJaRGRiTTZISDlmZ2VLUkFxRzRRVjU4cnFCV2VnNUtJSUdRIn0.eyJleHAiOjE3NTk3NTMzNjEsImlhdCI6MTc1OTc1MjQ2MSwiYXV0aF90aW1lIjoxNzU5NzUyNDYwLCJqdGkiOiI4YjVlZjNiZS03MTBiLTQ3ZTEtOWI0My1mMGQ5MjdlNzcxNWQiLCJpc3MiOiJodHRwczovL2FjY291bnRzLXRlc3RpbmcuYWFuYWFiLm5ldC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjdkNmFkMTE4LTY5NmYtNDVjOC05MDhkLWViMGRmZjg1MDMyMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFhbmFhYi1uZXh0Iiwibm9uY2UiOiIyYmU5YzNjMC1iZTFlLTRjMDQtODEwZC1iZTMxZWE5MmQzNmEiLCJzZXNzaW9uX3N0YXRlIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMzMDAiLCJodHRwczovL2FwcC10ZXN0aW5nLmFhbmFhYi5uZXQiLCJodHRwczovL3Rlc3RpbmcuYWFuYWFiLm5ldCIsImh0dHA6Ly9mcm9udGVuZC5hYW5hYWIubG9jYWxob3N0IiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwaG9uZSBwcm9maWxlIGVtYWlsIiwic2lkIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6Im1haG1vdWQiLCJnaXZlbl9uYW1lIjoiIiwiZmFtaWx5X25hbWUiOiIiLCJlbWFpbCI6Im1haG1vdWRAZGVzaWducGVlci5jb20ifQ.E0xwjJLHGd8CyUYhixgHlEZJHpQ1yewPsY6sZbxlY_t4HY7aPD_qenfqTeuxbdyNSWk5y4cwudkx4eiHorcZJA-4As_3WlKBMYgnxlRjurLnOFF_A_2oJ9g0On0Zjf1pBUErZmlG5fr-5dU0gXhILzXD9r4YwVE0p3sKzENRU1OLXbcyQtTJ5dMqzX3pJfInaO6z9euiHLJ84Jl7gL53NDL_ICglBBSJY1hE90VfXz7MT8nViPkmll4cBTTrbu6CxdIFsvX7vb2OsS6dwrIJDYC3oxosNdvZMlfIhu2MvIRB0owE0ET62aME_iLuiYmD7j_j00hM6w6cJPi_JfMQLg',
          },
          body: JSON.stringify(
            testType === 'chat'
              ? {
                message: query,
                course_id: courseId,
                session_id: `550e8400-e29b-41d4-a716-446655440000`, // Valid UUID format
                user_id: `7d6ad118-696f-45c8-908d-eb0dff850323`, // Valid Keycloak ID format
                mode: "rag",
                transport: "http",
                model_provider: modelProvider || 'openai',
                model: model || 'gpt-4o-mini',
                temperature: temperature || 0.7,
                max_tokens: maxTokens || 1000,
                include_sources: true,
                include_metadata: true
              }
              : {
                message: query,
                course_id: courseId,
                user_id: `test_${testType}_${Date.now()}`,
                session_id: `test_${testType}_${Date.now()}`,
                conversation_history: []
              }
          )
        });

        if (localResponse.ok) {
          const data = await localResponse.json();
          return NextResponse.json({
            success: true,
            response: data.response || data.message || 'No response received',
            tokensInput: data.tokens_input || data.tokensInput || 0,
            tokensOutput: data.tokens_output || data.tokensOutput || 0,
            costEstimate: data.cost_estimate || data.costEstimate || 0,
            sourcesCount: data.sources_count || data.sourcesCount || 0,
            toolsUsed: data.tools_used || data.toolsUsed || [],
            confidenceScore: data.confidence_score || data.confidenceScore || 0,
            error: null
          });
        } else {
          // If localhost fails and we're using localhost, try host.docker.internal
          if (baseUrl.includes('localhost')) {
            console.log('Localhost failed, trying host.docker.internal...');
            const dockerBaseUrl = baseUrl.replace('localhost', 'host.docker.internal');
            const dockerApiUrl = `${dockerBaseUrl}/api/v1/${testType === 'chat' ? 'chat/' : 'langgraph/chat'}`;
            console.log(`Trying Docker API call to: ${dockerApiUrl}`);

            const dockerResponse = await fetch(dockerApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Host': 'localhost:8000',
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItUU1pSGRBSEJaRGRiTTZISDlmZ2VLUkFxRzRRVjU4cnFCV2VnNUtJSUdRIn0.eyJleHAiOjE3NTk3NTMzNjEsImlhdCI6MTc1OTc1MjQ2MSwiYXV0aF90aW1lIjoxNzU5NzUyNDYwLCJqdGkiOiI4YjVlZjNiZS03MTBiLTQ3ZTEtOWI0My1mMGQ5MjdlNzcxNWQiLCJpc3MiOiJodHRwczovL2FjY291bnRzLXRlc3RpbmcuYWFuYWFiLm5ldC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjdkNmFkMTE4LTY5NmYtNDVjOC05MDhkLWViMGRmZjg1MDMyMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFhbmFhYi1uZXh0Iiwibm9uY2UiOiIyYmU5YzNjMC1iZTFlLTRjMDQtODEwZC1iZTMxZWE5MmQzNmEiLCJzZXNzaW9uX3N0YXRlIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMzMDAiLCJodHRwczovL2FwcC10ZXN0aW5nLmFhbmFhYi5uZXQiLCJodHRwczovL3Rlc3RpbmcuYWFuYWFiLm5ldCIsImh0dHA6Ly9mcm9udGVuZC5hYW5hYWIubG9jYWxob3N0IiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwaG9uZSBwcm9maWxlIGVtYWlsIiwic2lkIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6Im1haG1vdWQiLCJnaXZlbl9uYW1lIjoiIiwiZmFtaWx5X25hbWUiOiIiLCJlbWFpbCI6Im1haG1vdWRAZGVzaWducGVlci5jb20ifQ.E0xwjJLHGd8CyUYhixgHlEZJHpQ1yewPsY6sZbxlY_t4HY7aPD_qenfqTeuxbdyNSWk5y4cwudkx4eiHorcZJA-4As_3WlKBMYgnxlRjurLnOFF_A_2oJ9g0On0Zjf1pBUErZmlG5fr-5dU0gXhILzXD9r4YwVE0p3sKzENRU1OLXbcyQtTJ5dMqzX3pJfInaO6z9euiHLJ84Jl7gL53NDL_ICglBBSJY1hE90VfXz7MT8nViPkmll4cBTTrbu6CxdIFsvX7vb2OsS6dwrIJDYC3oxosNdvZMlfIhu2MvIRB0owE0ET62aME_iLuiYmD7j_j00hM6w6cJPi_JfMQLg',
              },
              body: JSON.stringify(
                testType === 'chat'
                  ? {
                    message: query,
                    course_id: courseId,
                    session_id: `550e8400-e29b-41d4-a716-446655440000`, // Valid UUID format
                    user_id: `7d6ad118-696f-45c8-908d-eb0dff850323`, // Valid Keycloak ID format
                    mode: "rag",
                    transport: "http",
                    model_provider: modelProvider || 'openai',
                    model: model || 'gpt-4o-mini',
                    temperature: temperature || 0.7,
                    max_tokens: maxTokens || 1000,
                    include_sources: true,
                    include_metadata: true
                  }
                  : {
                    message: query,
                    course_id: courseId,
                    user_id: `test_${testType}_${Date.now()}`,
                    session_id: `test_${testType}_${Date.now()}`,
                    conversation_history: []
                  }
              )
            });

            if (dockerResponse.ok) {
              const data = await dockerResponse.json();
              console.log('Docker API response data:', data);
              return NextResponse.json({
                success: data.success || data.status === 'success' || true,
                response: data.response || data.message || 'No response received',
                tokensInput: data.tokens_input || data.tokensInput || 0,
                tokensOutput: data.tokens_output || data.tokensOutput || 0,
                costEstimate: data.cost_estimate || data.costEstimate || 0,
                sourcesCount: data.sources_count || data.sourcesCount || 0,
                toolsUsed: data.tools_used || data.toolsUsed || [],
                confidenceScore: data.confidence_score || data.confidenceScore || 0,
                error: null
              });
            }
          }
          throw new Error(`API returned status ${localResponse.status}`);
        }
      } catch (error) {
        console.log('⚠️  Real API call failed, using mock response:', error);
        console.log('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
          error: error
        });

        // Fallback to mock response if real API fails
        return NextResponse.json({
          success: true,
          response: `Mock response for local testing:\n\nQuery: "${query}"\nCourse: ${courseId}\nSystem: ${testType}\n\nReal API call failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThis is a placeholder response for development and testing purposes.`,
          tokensInput: Math.floor(Math.random() * 100) + 50,
          tokensOutput: Math.floor(Math.random() * 200) + 100,
          costEstimate: Math.random() * 0.1,
          sourcesCount: Math.floor(Math.random() * 5),
          error: null
        });
      }
    }

    // Prepare headers for the external API call
    const headers = {
      'Content-Type': 'application/json',
      ...(bearerToken && bearerToken !== 'your-bearer-token-here' && { 'Authorization': `Bearer ${bearerToken}` })
    };

    let response;
    let data;

    if (testType === 'chat') {
      // Try chat endpoint first
      try {
        // Use localhost directly for testing
        let apiUrl = `${baseUrl}/api/v1/chat/`;
        console.log(`Attempting chat API call to: ${apiUrl}`);
        response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: query,
            course_id: courseId,
            session_id: `550e8400-e29b-41d4-a716-446655440000`, // Valid UUID format
            user_id: `7d6ad118-696f-45c8-908d-eb0dff850323`, // Valid Keycloak ID format
            mode: "rag",
            transport: "http",
            model_provider: modelProvider,
            model: model,
            temperature: temperature,
            max_tokens: maxTokens,
            include_sources: true,
            include_metadata: true
          })
        });

        console.log(`Chat API response status: ${response.status}`);

        if (response.ok) {
          data = await response.json();
          console.log('Chat API response data:', data);

          // Use actual token data from API response (no estimation needed)
          const assistantResponse = data.response || data.message || 'No response received';

          console.log('API response token data:', {
            tokens_used: data.tokens_used,
            tokens_input: data.tokens_input,
            tokens_output: data.tokens_output,
            cost_estimate: data.cost_estimate,
            model_name: data.model_name,
            model_provider: data.model_provider
          });

          return NextResponse.json({
            success: data.status === 'success' || data.success !== false,
            response: assistantResponse,
            tokensInput: data.tokens_input || 0,
            tokensOutput: data.tokens_output || 0,
            costEstimate: data.cost_estimate || 0,
            sourcesCount: data.sources?.length || 0,
            toolsUsed: data.tools_used || data.toolsUsed || [],
            confidenceScore: data.confidence_score || data.confidenceScore || 0,
            error: data.status !== 'success' ? 'API returned error status' : null
          });
        } else {
          const errorText = await response.text();
          console.log(`Chat API error response: ${errorText}`);
        }
      } catch (error) {
        console.log('Chat endpoint failed:', error);
      }

      // If chat fails, try search endpoint
      try {
        // For Docker, use host.docker.internal to reach the host machine
        const dockerBaseUrl = baseUrl.replace('localhost', 'host.docker.internal');
        console.log(`Attempting search API call to: ${dockerBaseUrl}/api/v1/search/`);
        response = await fetch(`${dockerBaseUrl}/api/v1/search/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: query,
            course_id: courseId
          })
        });

        console.log(`Search API response status: ${response.status}`);

        if (response.ok) {
          data = await response.json();
          const results = data.results || [];
          const sourcesCount = results.length;

          // Create a summary response from search results
          let responseText = '';
          if (results.length > 0) {
            responseText = `Found ${sourcesCount} relevant results for your query about course ${courseId}:\n\n`;
            for (let i = 0; i < Math.min(3, results.length); i++) {
              const result = results[i];
              const text = result.text || '';
              const score = result.score || 0;
              responseText += `${i + 1}. (Score: ${score.toFixed(2)}) ${text.substring(0, 200)}...\n\n`;
            }
          } else {
            responseText = `No specific results found for your query about course ${courseId}.`;
          }

          return NextResponse.json({
            success: true,
            response: responseText,
            tokensInput: 0,
            tokensOutput: 0,
            costEstimate: 0,
            sourcesCount: sourcesCount,
            searchResults: data,
            error: null
          });
        } else {
          const errorText = await response.text();
          console.log(`Search API error response: ${errorText}`);
        }
      } catch (error) {
        console.log('Search endpoint also failed:', error);
      }

      return NextResponse.json({
        success: false,
        response: '',
        tokensInput: 0,
        tokensOutput: 0,
        costEstimate: 0,
        sourcesCount: 0,
        error: 'Both chat and search endpoints failed'
      });

    } else if (testType === 'langgraph') {
      // Try LangGraph endpoint
      try {
        // Use localhost directly for testing
        let apiUrl = `${baseUrl}/api/v1/langgraph/chat`;
        console.log(`Attempting LangGraph API call to: ${apiUrl}`);
        response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: query,
            course_id: courseId,
            user_id: `test_user_${Date.now()}`,
            session_id: `test_session_${Date.now()}`,
            conversation_history: []
          })
        });

        if (response.ok) {
          data = await response.json();
          console.log('LangGraph API response data:', data);
          return NextResponse.json({
            success: data.success || true,
            response: data.response || data.message || 'No response received',
            tokensInput: data.tokens_input || data.tokensInput || 0,
            tokensOutput: data.tokens_output || data.tokensOutput || 0,
            costEstimate: data.cost_estimate || data.costEstimate || 0,
            sourcesCount: data.sources?.length || 0,
            toolsUsed: data.tools_used || data.toolsUsed || [],
            confidenceScore: data.confidence_score || data.confidenceScore || 0,
            error: null
          });
        } else {
          const errorText = await response.text();
          console.log(`LangGraph API error response: ${errorText}`);
        }
      } catch (error) {
        console.log('LangGraph endpoint failed:', error);
      }

      // Fallback if LangGraph fails
      return NextResponse.json({
        success: false,
        response: 'LangGraph system not available or failed to connect',
        tokensInput: 0,
        tokensOutput: 0,
        costEstimate: 0,
        toolsUsed: [],
        confidenceScore: 0,
        error: 'LangGraph endpoint not available or failed to connect'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test type'
    }, { status: 400 });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
