import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.env.HOME || '/tmp', '.collab-relay');
const PATIENTS_FILE = join(DATA_DIR, 'professional-patients.json');

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(PATIENTS_FILE)) writeFileSync(PATIENTS_FILE, '[]', 'utf-8');
}

function read() {
  ensure();
  try { return JSON.parse(readFileSync(PATIENTS_FILE, 'utf-8')); } catch { return []; }
}

export async function GET() {
  const patients = read();
  return NextResponse.json(patients);
}
