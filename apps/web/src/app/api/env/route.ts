import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = process.env.RUNTIME_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return NextResponse.json({
    API_URL: apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`
  });
}
