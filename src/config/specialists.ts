/**
 * Maps each service to the specialist team responsible for it.
 * Calendar IDs are resolved from environment variables at startup.
 * Placeholder emails — client to confirm final addresses.
 */

export interface SpecialistConfig {
  displayName: string;
  email: string;      // added as attendee on the calendar event
  calendarId: string; // Google Calendar ID (typically the account email)
}

function envId(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const SERVICE_SPECIALISTS = {
  logopedia: {
    displayName: 'Equipo de Logopedia',
    email: 'logopedia@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_LOGOPEDIA', 'logopedia@abccentre.es'),
  },
  psicologia: {
    displayName: 'Equipo de Psicología',
    email: 'psicologia@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_PSICOLOGIA', 'psicologia@abccentre.es'),
  },
  neuropsicologia: {
    displayName: 'Equipo de Neuropsicología',
    email: 'neuropsicologia@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_NEUROPSICOLOGIA', 'neuropsicologia@abccentre.es'),
  },
  psicopedagogia: {
    displayName: 'Equipo de Psicopedagogia',
    email: 'citas@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_GENERAL', 'citas@abccentre.es'),
  },
  tea: {
    displayName: 'Equipo TEA',
    email: 'citas@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_GENERAL', 'citas@abccentre.es'),
  },
  'rehabilitacion-voz': {
    displayName: 'Rehabilitación de Voz',
    email: 'citas@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_GENERAL', 'citas@abccentre.es'),
  },
  'terapia-familiar': {
    displayName: 'Terapia Familiar',
    email: 'citas@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_GENERAL', 'citas@abccentre.es'),
  },
  'habilidades-sociales': {
    displayName: 'Habilidades Sociales',
    email: 'citas@abccentre.es',
    calendarId: envId('GOOGLE_CALENDAR_ID_GENERAL', 'citas@abccentre.es'),
  },
} as const satisfies Record<string, SpecialistConfig>;

export type Service = keyof typeof SERVICE_SPECIALISTS;
