import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const { patientId, consent } = await request.json();
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }
    const patients = read();
    const existing = patients.find((p: { id: string }) => p.id === patientId);
    if (existing) {
      existing.consent = consent;
      existing.updatedAt = new Date().toISOString();
    } else {
      patients.push({
        id: patientId,
        consent: !!consent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
