import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const FILE = join(DATA_DIR, 'questions.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(FILE)) writeFileSync(FILE, '[]', 'utf-8');
}

function read() {
  ensure();
  try { return JSON.parse(readFileSync(FILE, 'utf-8')); } catch { return []; }
}

export async function GET() {
  const all = read();
  return NextResponse.json(all.filter((q: { answer: unknown }) => !q.answer));
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, question, options } = await request.json();
    const data = read();
    const entry = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskId: taskId || null,
      question,
      options: options || [],
      answer: null,
      askedAt: new Date().toISOString(),
      answeredAt: null,
    };
    data.push(entry);
    writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}
