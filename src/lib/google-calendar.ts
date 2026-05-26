import { resolveCalendarId, SPECIALISTS, SERVICE_TEAM, getLeadSpecialistId } from '@/config/specialists';
import type { Service, SpecialistId } from '@/config/specialists';

// Re-export types used by other files
export type { Service } from '@/config/specialists';

// ─── Shared types ────────────────────────────────────────────────────────────

export interface TimeSlot {
  start: string; // ISO 8601 with timezone offset
  end:   string;
  available: boolean;
}

export interface BookingRequest {
  service:      Service;
  specialistId: SpecialistId;
  patientName:  string;
  patientAge?:  number | string;
  guardianName?: string;
  email:        string;
  phone:        string;
  message?:     string;
  selectedSlot: TimeSlot;
}

export interface BookingResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TZ = 'Europe/Madrid';

/** Slot start hours (24h). Each session = 50 min; 10-min gap. */
const SLOT_HOURS = [9, 10, 11, 12, 13, 16, 17, 18, 19] as const;

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function hasCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

function getPrivateKey(): string {
  const raw = process.env.GOOGLE_PRIVATE_KEY ?? '';
  return raw.replace(/\\n/g, '\n');
}

async function getCalendarAuth() {
  const { google } = await import('googleapis');
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────

function getMadridOffsetStr(date: Date): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: TZ,
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+1';
  const match = tzName.match(/GMT([+-]\d{1,2}:\d{2})/);
  if (!match) return '+01:00';
  const [sign, rest] = [match[1][0], match[1].slice(1)];
  const [h, m] = rest.split(':');
  return `${sign}${h.padStart(2, '0')}:${m ?? '00'}`;
}

function buildMadridISO(dateStr: string, hour: number, minute = 0): string {
  const ref = new Date(`${dateStr}T12:00:00Z`);
  const offset = getMadridOffsetStr(ref);
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${dateStr}T${hh}:${mm}:00${offset}`;
}

function toMadridDateStr(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// ─── Slot helpers ─────────────────────────────────────────────────────────────

function generateCandidateSlots(dateStr: string): TimeSlot[] {
  return SLOT_HOURS.map((hour) => ({
    start: buildMadridISO(dateStr, hour, 0),
    end:   buildMadridISO(dateStr, hour, 50),
    available: true,
  }));
}

interface BusyPeriod { start: string; end: string }

function markAvailability(candidates: TimeSlot[], busy: BusyPeriod[]): TimeSlot[] {
  return candidates.map((slot) => {
    const slotStart = new Date(slot.start).getTime();
    const slotEnd   = new Date(slot.end).getTime();
    const isBusy = busy.some((b) => {
      const busyStart = new Date(b.start).getTime();
      const busyEnd   = new Date(b.end).getTime();
      return slotStart < busyEnd && slotEnd > busyStart;
    });
    return { ...slot, available: !isBusy };
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns time slots for a given specialist and date.
 * Falls back to mock data when credentials or calendarId are not configured.
 */
export async function getAvailableSlots(
  specialistId: SpecialistId,
  dateFrom: Date,
  _dateTo: Date
): Promise<TimeSlot[]> {
  const calendarId = resolveCalendarId(specialistId);

  if (!hasCredentials() || !calendarId) {
    return getMockSlots(dateFrom);
  }

  const dateStr = toMadridDateStr(dateFrom);
  const candidates = generateCandidateSlots(dateStr);

  try {
    const auth = await getCalendarAuth();
    const { google } = await import('googleapis');
    const calendar = google.calendar({ version: 'v3', auth });

    const dayStart = buildMadridISO(dateStr, 0, 0);
    const dayEnd   = buildMadridISO(dateStr, 23, 59);

    const freebusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart,
        timeMax: dayEnd,
        timeZone: TZ,
        items: [{ id: calendarId }],
      },
    });

    const busy = freebusyRes.data.calendars?.[calendarId]?.busy ?? [];
    return markAvailability(candidates, busy as BusyPeriod[]);
  } catch (err) {
    console.error('[GoogleCalendar] getAvailableSlots error:', err);
    return candidates; // return all-available on error so UI isn't broken
  }
}

/**
 * Creates a Google Calendar event for the confirmed booking.
 */
export async function createBooking(request: BookingRequest): Promise<BookingResult> {
  const specialist = SPECIALISTS[request.specialistId];
  const calendarId = resolveCalendarId(request.specialistId);

  if (!hasCredentials() || !calendarId) {
    console.warn('[GoogleCalendar] No credentials/calendarId — booking logged to console only');
    console.log('[BookingRequest]', JSON.stringify(request, null, 2));
    return { success: true, eventId: 'mock-event-id' };
  }

  try {
    const auth = await getCalendarAuth();
    const { google } = await import('googleapis');
    const calendar = google.calendar({ version: 'v3', auth });

    const event = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      requestBody: {
        summary: `Primera consulta — ${request.patientName}`,
        description: buildEventDescription(request, specialist.name, specialist.role),
        start: { dateTime: request.selectedSlot.start, timeZone: TZ },
        end:   { dateTime: request.selectedSlot.end,   timeZone: TZ },
        attendees: [
          { email: request.email },
          { email: specialist.email },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    });

    return { success: true, eventId: event.data.id ?? undefined };
  } catch (err) {
    console.error('[GoogleCalendar] createBooking error:', err);
    return { success: false, error: 'No se pudo crear el evento en Google Calendar' };
  }
}

/**
 * Returns the lead specialist ID for a service (first in the team list).
 * Useful when no specific specialist has been selected.
 */
export function getLeadSpecialist(service: Service): SpecialistId {
  return getLeadSpecialistId(service);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildEventDescription(
  request: BookingRequest,
  specialistName: string,
  specialistRole: string
): string {
  const lines = [
    `NUEVA CITA — ${specialistName} (${specialistRole})`,
    '',
    `Paciente: ${request.patientName}${request.patientAge ? `, ${request.patientAge} años` : ''}`,
    request.guardianName ? `Familiar: ${request.guardianName}` : null,
    `Email: ${request.email}`,
    `Teléfono: ${request.phone}`,
    `Servicio: ${request.service}`,
    '',
    request.message ? `Motivo de consulta:\n${request.message}` : null,
    '',
    `Reserva creada: ${new Date().toLocaleString('es-ES', { timeZone: TZ })}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function getMockSlots(from: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);

  for (let day = 0; day < 7; day++) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const dateStr = d.toISOString().split('T')[0];
      for (const hour of SLOT_HOURS) {
        slots.push({
          start: buildMadridISO(dateStr, hour, 0),
          end:   buildMadridISO(dateStr, hour, 50),
          available: Math.random() > 0.3,
        });
      }
    }
    d.setDate(d.getDate() + 1);
  }

  return slots;
}
