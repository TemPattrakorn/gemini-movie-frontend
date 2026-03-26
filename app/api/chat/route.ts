import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Read the payload sent from the React frontend
    const body = await request.json();

    // 2. Grab the backend URL from the Vercel server environment
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // 3. Forward the request to Python backend
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_SECRET_KEY || 'my-local-secret',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 4. Return the response to the frontend
    if (!response.ok) {
      return NextResponse.json({ error: 'Backend error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}