// src/app/api/getAbsence/route.js
import { NextResponse } from 'next/server';
import { getAllSubjectAbsence, getTotalAbsence } from './getAbsenceDB.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const card_id = searchParams.get("card_id");
  const dateFrom = searchParams.get("from");
  const dateTo = searchParams.get("to");

  if (!card_id) {
    return NextResponse.json({ error: 'Missing card_id' }, { status: 400 });
  }

  const allAbsences = await getAllSubjectAbsence(card_id, dateFrom, dateTo);
  const total = await getTotalAbsence(card_id, dateFrom, dateTo);

  return NextResponse.json({ allAbsences, total });
}