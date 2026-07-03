import { NextResponse } from 'next/server';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const TASKS_FILE = join(DATA_DIR, 'tasks.json');

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(TASKS_FILE)) writeFileSync(TASKS_FILE, '[]', 'utf-8');
}

export async function GET() {
  ensureDir();
  try {
    const tasks = JSON.parse(readFileSync(TASKS_FILE, 'utf-8'));
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json([]);
  }
}
