import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'ScanCanvas Cloud Run Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
