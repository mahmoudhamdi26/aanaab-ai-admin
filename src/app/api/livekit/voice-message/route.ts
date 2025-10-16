import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_name, user_id, message, course_id } = body;

    if (!room_name || !user_id || !message) {
      return NextResponse.json(
        { error: 'Room name, user ID, and message are required' },
        { status: 400 }
      );
    }

    // Get AI service URL from environment
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    // Forward request to AI service
    const response = await fetch(`${aiServiceUrl}/api/v1/livekit-chat/voice-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        'Authorization': `Bearer ${process.env.ADMIN_API_KEY || ''}`,
      },
      body: JSON.stringify({
        room_name,
        user_id,
        message,
        course_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to process voice message' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Voice message processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
