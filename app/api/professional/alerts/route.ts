import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const ALERTS_FILE = join(DATA_DIR, 'professional-alerts.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(ALERTS_FILE)) writeFileSync(ALERTS_FILE, '[]', 'utf-8');
}

function read() {
  ensure();
  try { return JSON.parse(readFileSync(ALERTS_FILE, 'utf-8')); } catch { return []; }
}

export async function GET() {
  const alerts = read().reverse();
  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, reason, severity, triggeredBy } = await request.json();
    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }
    const alerts = read();
    const entry = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      patientId: patientId || 'user-1',
      reason,
      severity: severity || 'medium',
      triggeredBy: triggeredBy || 'chatbot',
      acknowledged: false,
      createdAt: new Date().toISOString(),
    };
    alerts.push(entry);
    writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
