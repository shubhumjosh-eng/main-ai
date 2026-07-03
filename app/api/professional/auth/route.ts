import { NextRequest, NextResponse } from 'next/server';
import { createMockJWT, parseMockJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (email === 'pro@mindful.space' && password === 'pro123') {
      const token = createMockJWT({ sub: 'pro-1', role: 'professional', name: 'Dr. Riley' });
      return NextResponse.json({ ok: true, token, user: { id: 'pro-1', name: 'Dr. Riley', email } });
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  const payload = parseMockJWT(token);
  if (!payload || payload.role !== 'professional') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: payload });
}
