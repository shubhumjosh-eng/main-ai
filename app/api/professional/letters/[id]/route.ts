import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const LETTERS_FILE = join(DATA_DIR, 'professional-letters.json');

function read() {
  if (!existsSync(LETTERS_FILE)) return [];
  try { return JSON.parse(readFileSync(LETTERS_FILE, 'utf-8')); } catch { return []; }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { read: markRead } = await request.json();
    const letters = read();
    const idx = letters.findIndex((l: { id: string }) => l.id === params.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'letter not found' }, { status: 404 });
    }
    if (markRead !== undefined) letters[idx].read = markRead;
    writeFileSync(LETTERS_FILE, JSON.stringify(letters, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
