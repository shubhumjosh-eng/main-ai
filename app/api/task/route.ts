import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const TASKS_FILE = join(DATA_DIR, 'tasks.json');
const MSGS_FILE = join(DATA_DIR, 'messages.json');

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(TASKS_FILE)) writeFileSync(TASKS_FILE, '[]', 'utf-8');
  if (!existsSync(MSGS_FILE)) writeFileSync(MSGS_FILE, '[]', 'utf-8');
}

function readJSON(path: string) {
  ensureDir();
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return []; }
}

function writeJSON(path: string, data: unknown) {
  ensureDir();
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const { task, sender } = await request.json();
    if (!task || typeof task !== 'string' || !task.trim()) {
      return NextResponse.json({ error: 'task is required' }, { status: 400 });
    }

    const tasks = readJSON(TASKS_FILE);
    const entry = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      task: task.trim(),
      sender: (sender || 'anonymous').toString().trim(),
      status: 'pending',
      result: null,
      createdAt: new Date().toISOString(),
    };
    tasks.push(entry);
    writeJSON(TASKS_FILE, tasks);

    const msgs = readJSON(MSGS_FILE);
    msgs.push({
      id: entry.id,
      from: 'user',
      to: 'agent-a',
      content: `NEW TASK: ${task.trim()}`,
      taskId: entry.id,
      timestamp: entry.createdAt,
    });
    writeJSON(MSGS_FILE, msgs);

    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
