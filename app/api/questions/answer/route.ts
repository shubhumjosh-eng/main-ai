import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const FILE = join(DATA_DIR, 'questions.json');
const MSGS_FILE = join(DATA_DIR, 'messages.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(path: string) {
  ensure();
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return []; }
}

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer } = await request.json();
    const questions = readJSON(FILE);
    const q = questions.find((q: { id: string }) => q.id === questionId);
    if (!q) {
      return NextResponse.json({ error: 'question not found' }, { status: 404 });
    }
    q.answer = answer;
    q.answeredAt = new Date().toISOString();
    writeFileSync(FILE, JSON.stringify(questions, null, 2), 'utf-8');

    const msgs = readJSON(MSGS_FILE);
    msgs.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: 'user',
      to: 'agent-a',
      content: `ANSWERS: Question "${q.question}" answered: ${answer}`,
      taskId: q.taskId,
      timestamp: new Date().toISOString(),
    });
    writeFileSync(MSGS_FILE, JSON.stringify(msgs, null, 2), 'utf-8');

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}
