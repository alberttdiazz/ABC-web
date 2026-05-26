import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, getLeadSpecialist } from '@/lib/google-calendar';
import type { Service } from '@/config/specialists';
import type { SpecialistId } from '@/config/specialists';
import { SPECIALISTS, SERVICE_TEAM } from '@/config/specialists';

export async function GET(req: NextRequest) {
  const dateStr      = req.nextUrl.searchParams.get('date');
  const serviceParam = req.nextUrl.searchParams.get('service') as Service | null;
  const specialistParam = req.nextUrl.searchParams.get('specialist') as SpecialistId | null;

  // Require at least a date
  if (!dateStr) {
    return NextResponse.json({ error: 'Se requiere el parámetro date' }, { status: 400 });
  }

  const from = new Date(`${dateStr}T00:00:00`);
  if (isNaN(from.getTime())) {
    return NextResponse.json({ error: 'Formato de fecha inválido' }, { status: 400 });
  }

  // Resolve specialistId: explicit param > first of service team > error
  let specialistId: SpecialistId | null = null;

  if (specialistParam && specialistParam in SPECIALISTS) {
    specialistId = specialistParam;
  } else if (serviceParam && serviceParam in SERVICE_TEAM) {
    specialistId = getLeadSpecialist(serviceParam);
  }

  if (!specialistId) {
    return NextResponse.json(
      { error: 'Se requiere specialist (o service) válido' },
      { status: 400 }
    );
  }

  const allSlots = await getAvailableSlots(specialistId, from, from);

  // Filter to the requested day
  const daySlots = allSlots.filter((slot) => {
    const slotDate = new Date(slot.start);
    return (
      slotDate.getFullYear() === from.getFullYear() &&
      slotDate.getMonth()    === from.getMonth()    &&
      slotDate.getDate()     === from.getDate()
    );
  });

  return NextResponse.json({ slots: daySlots, specialistId });
}
