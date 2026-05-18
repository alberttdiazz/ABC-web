'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Service, TimeSlot } from '@/lib/google-calendar';

const SERVICES: { value: Service; label: string }[] = [
  { value: 'logopedia',            label: 'Logopedia' },
  { value: 'psicologia',           label: 'Psicología' },
  { value: 'neuropsicologia',      label: 'Neuropsicología' },
  { value: 'psicopedagogia',       label: 'Psicopedagogia' },
  { value: 'tea',                  label: 'TEA (Autismo)' },
  { value: 'rehabilitacion-voz',   label: 'Rehabilitación de Voz' },
  { value: 'terapia-familiar',     label: 'Terapia Familiar' },
  { value: 'habilidades-sociales', label: 'Habilidades Sociales' },
];

const TODAY = new Date().toISOString().split('T')[0];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  defaultService?: Service;
}

export default function BookingForm({ defaultService }: Props) {
  const t = useTranslations('contacto');

  const [form, setForm] = useState({
    patientName:  '',
    patientAge:   '',
    guardianName: '',
    email:        '',
    phone:        '',
    service:      defaultService ?? ('' as Service | ''),
    message:      '',
    privacy:      false,
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Fetch available slots whenever service or date changes
  useEffect(() => {
    if (!form.service || !selectedDate) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/availability?service=${form.service}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setAvailableSlots(data.slots ?? []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.service, selectedDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setStatus('sending');

    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedSlot }),
      });

      if (res.ok) {
        setStatus('success');
        setForm({
          patientName: '', patientAge: '', guardianName: '',
          email: '', phone: '', service: defaultService ?? '',
          message: '', privacy: false,
        });
        setSelectedDate('');
        setSelectedSlot(null);
        setAvailableSlots([]);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-lime/20 border border-lime rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-outfit font-semibold text-xl text-ink mb-2">{t('form_success')}</h3>
      </div>
    );
  }

  const freeSlots = availableSlots.filter((s) => s.available);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Patient data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="patientName" className="block text-sm font-semibold text-ink mb-1.5">
            {t('form_name_patient')} *
          </label>
          <input
            id="patientName" name="patientName" type="text" required
            value={form.patientName} onChange={handleChange}
            className="field-base"
          />
        </div>
        <div>
          <label htmlFor="patientAge" className="block text-sm font-semibold text-ink mb-1.5">
            {t('form_age')}
          </label>
          <input
            id="patientAge" name="patientAge" type="number" min="0" max="99"
            value={form.patientAge} onChange={handleChange}
            className="field-base"
          />
        </div>
      </div>

      <div>
        <label htmlFor="guardianName" className="block text-sm font-semibold text-ink mb-1.5">
          {t('form_guardian')}
        </label>
        <input
          id="guardianName" name="guardianName" type="text"
          value={form.guardianName} onChange={handleChange}
          className="field-base"
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
            {t('form_email')} *
          </label>
          <input
            id="email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            className="field-base"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-ink mb-1.5">
            {t('form_phone')} *
          </label>
          <input
            id="phone" name="phone" type="tel" required
            value={form.phone} onChange={handleChange}
            className="field-base"
          />
        </div>
      </div>

      {/* Service */}
      <div>
        <label htmlFor="service" className="block text-sm font-semibold text-ink mb-1.5">
          {t('form_service')} *
        </label>
        <select
          id="service" name="service" required
          value={form.service} onChange={handleChange}
          className="w-full px-4 py-3 bg-cream border border-gray/20 rounded-xl text-sm font-light focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors appearance-none"
        >
          <option value="">{t('form_service_placeholder')}</option>
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-ink mb-1.5">
          {t('form_message')}
        </label>
        <textarea
          id="message" name="message" rows={3}
          value={form.message} onChange={handleChange}
          className="w-full px-4 py-3 bg-cream border border-gray/20 rounded-xl text-sm font-light focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors resize-none"
        />
      </div>

      {/* ── Slot picker ──────────────────────────────────────────── */}
      <div className="border-t border-gray/10 pt-5">
        <p className="text-sm font-semibold text-ink mb-4">Elige fecha y hora *</p>

        <div>
          <label htmlFor="selectedDate" className="block text-xs font-semibold text-gray uppercase tracking-wider mb-1.5">
            Fecha preferida
          </label>
          <input
            id="selectedDate"
            type="date"
            min={TODAY}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 bg-cream border border-gray/20 rounded-xl text-sm font-light focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
          />
        </div>

        {selectedDate && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray uppercase tracking-wider mb-2">
              Horarios disponibles
            </p>

            {loadingSlots && (
              <p className="text-sm font-light text-gray">Comprobando disponibilidad…</p>
            )}

            {!loadingSlots && availableSlots.length === 0 && (
              <p className="text-sm font-light text-gray">
                No hay sesiones disponibles este día. Prueba con otra fecha.
              </p>
            )}

            {!loadingSlots && freeSlots.length === 0 && availableSlots.length > 0 && (
              <p className="text-sm font-light text-gray">
                Todas las horas están ocupadas este día. Prueba con otra fecha.
              </p>
            )}

            {!loadingSlots && freeSlots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 text-sm rounded-xl border transition-all duration-150 font-outfit ${
                        isSelected
                          ? 'bg-teal text-white border-teal font-semibold'
                          : slot.available
                          ? 'bg-cream border-gray/20 text-ink hover:border-teal hover:text-teal'
                          : 'bg-gray/5 text-gray/30 border-gray/10 cursor-not-allowed line-through'
                      }`}
                    >
                      {formatTime(slot.start)}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedSlot && (
              <p className="mt-3 text-sm font-semibold text-teal">
                ✓ Hora seleccionada: {formatTime(selectedSlot.start)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Privacy */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox" name="privacy"
          checked={form.privacy} onChange={handleChange}
          required className="mt-0.5 w-4 h-4 accent-teal"
        />
        <span className="text-sm font-light text-gray">
          He leído y acepto la{' '}
          <a href="/politica-de-privacidad" className="text-teal underline hover:no-underline">
            política de privacidad
          </a>
        </span>
      </label>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{t('form_error')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending' || !form.privacy || !selectedSlot}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando…
          </>
        ) : t('form_submit')}
      </button>

      {!selectedSlot && form.privacy && (
        <p className="text-xs text-gray text-center">Selecciona una fecha y hora para continuar</p>
      )}
    </form>
  );
}
