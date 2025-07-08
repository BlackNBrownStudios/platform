import { NextRequest, NextResponse } from 'next/server';

// This file creates a catch-all API route that proxies requests to the backend server
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;

  try {
    const res = await fetch(`${apiBaseUrl}/v1/${path}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ message: 'Failed to fetch data from API' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;

  try {
    const body = await request.json();
    const res = await fetch(`${apiBaseUrl}/v1/${path}${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ message: 'Failed to post data to API' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;

  try {
    const body = await request.json();
    const res = await fetch(`${apiBaseUrl}/v1/${path}${queryString}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ message: 'Failed to update data on API' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;

  try {
    const res = await fetch(`${apiBaseUrl}/v1/${path}${queryString}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ message: 'Failed to delete data on API' }, { status: 500 });
  }
}
