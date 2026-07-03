import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const FILE = join(DATA_DIR, 'agent-status.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(FILE)) writeFileSync(FILE, '[]', 'utf-8');
}

function read() {
  ensure();
  try { return JSON.parse(readFileSync(FILE, 'utf-8')); } catch { return []; }
}

export async function GET() {
  return NextResponse.json(read().slice(-20));
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, status, taskId } = await request.json();
    const data = read();
    data.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId: agentId || 'agent',
      status,
      taskId: taskId || null,
      timestamp: new Date().toISOString(),
    });
    writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}
