import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const LETTERS_FILE = join(DATA_DIR, 'professional-letters.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(LETTERS_FILE)) writeFileSync(LETTERS_FILE, '[]', 'utf-8');
}

function read() {
  ensure();
  try { return JSON.parse(readFileSync(LETTERS_FILE, 'utf-8')); } catch { return []; }
}

export async function GET() {
  const letters = read().reverse();
  return NextResponse.json(letters);
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, content, title, anonymous } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    const letters = read();
    const entry = {
      id: `letter-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      patientId: anonymous ? 'anonymous' : (patientId || 'user-1'),
      patientName: anonymous ? 'Anonymous' : null,
      title: title || 'Untitled Letter',
      content,
      anonymous: !!anonymous,
      read: false,
      createdAt: new Date().toISOString(),
    };
    letters.push(entry);
    writeFileSync(LETTERS_FILE, JSON.stringify(letters, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
