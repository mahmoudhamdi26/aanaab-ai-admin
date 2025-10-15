import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing fetch call...');
    
    // Test localhost first
    try {
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: 'Test question',
          course_id: '89',
          session_id: 'test_session',
          model_provider: 'openai',
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      console.log('Localhost response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: 'Localhost API call successful',
          data: data
        });
      }
    } catch (error) {
      console.log('Localhost failed:', error);
    }
    
    // Test host.docker.internal
    try {
      const response = await fetch('http://host.docker.internal:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: 'Test question',
          course_id: '89',
          session_id: 'test_session',
          model_provider: 'openai',
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      console.log('Docker internal response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: 'Docker internal API call successful',
          data: data
        });
      }
    } catch (error) {
      console.log('Docker internal failed:', error);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Both API calls failed'
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
