import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/google-calendar';
import { sendPatientConfirmation, sendInternalNotification } from '@/lib/gmail';
import type { BookingRequest } from '@/lib/google-calendar';
import type { Service } from '@/config/specialists';

const VALID_SERVICES = new Set<Service>([
  'logopedia', 'psicologia', 'neuropsicologia', 'psicopedagogia',
  'tea', 'rehabilitacion-voz', 'terapia-familiar', 'habilidades-sociales',
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientName, email, phone, service, selectedSlot } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!patientName || !email || !phone || !service || !selectedSlot) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!VALID_SERVICES.has(service as Service)) {
      return NextResponse.json({ error: 'Servicio no válido' }, { status: 400 });
    }

    if (!selectedSlot.start || !selectedSlot.end) {
      return NextResponse.json({ error: 'Franja horaria no válida' }, { status: 400 });
    }

    // ── Build typed request ───────────────────────────────────────────────────
    const bookingRequest: BookingRequest = {
      service: service as Service,
      patientName: String(patientName).trim(),
      patientAge: body.patientAge ?? undefined,
      guardianName: body.guardianName?.trim() || undefined,
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      message: body.message?.trim() || undefined,
      selectedSlot,
    };

    // ── Create calendar event ─────────────────────────────────────────────────
    const result = await createBooking(bookingRequest);

    if (!result.success) {
      console.error('[Appointment] Calendar creation failed:', result.error);
      return NextResponse.json(
        { error: 'No se pudo confirmar la cita. Por favor llámanos.' },
        { status: 500 }
      );
    }

    // ── Send emails (non-blocking — failures are logged but don't abort) ──────
    await Promise.allSettled([
      sendPatientConfirmation(bookingRequest),
      sendInternalNotification(bookingRequest),
    ]);

    return NextResponse.json({ success: true, eventId: result.eventId });
  } catch (err) {
    console.error('[Appointment API Error]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
