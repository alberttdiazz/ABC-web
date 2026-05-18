import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/google-calendar';
import type { Service } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get('service') as Service | null;
  const dateStr = req.nextUrl.searchParams.get('date');

  if (!service || !dateStr) {
    return NextResponse.json({ error: 'Se requieren los parámetros service y date' }, { status: 400 });
  }

  const from = new Date(`${dateStr}T00:00:00`);

  if (isNaN(from.getTime())) {
    return NextResponse.json({ error: 'Formato de fecha inválido' }, { status: 400 });
  }

  const allSlots = await getAvailableSlots(service, from, from);

  // Filter to only return slots for the requested day
  const daySlots = allSlots.filter((slot) => {
    const slotDate = new Date(slot.start);
    return (
      slotDate.getFullYear() === from.getFullYear() &&
      slotDate.getMonth() === from.getMonth() &&
      slotDate.getDate() === from.getDate()
    );
  });

  return NextResponse.json({ slots: daySlots });
}
