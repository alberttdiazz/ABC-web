import type { MetadataRoute } from 'next';

const BASE = 'https://abccentre.es';

const ES_PATHS = [
  '',
  '/servicios',
  '/logopedia',
  '/psicologia',
  '/neuropsicologia',
  '/psicopedagogia',
  '/tea',
  '/rehabilitacion-voz',
  '/terapia-familiar',
  '/habilidades-sociales',
  '/equipo',
  '/contacto',
];

const CA_PATHS = [
  '',
  '/serveis',
  '/logopedia',
  '/psicologia',
  '/neuropsicologia',
  '/psicopedagogia',
  '/tea',
  '/rehabilitacio-veu',
  '/terapia-familiar',
  '/habilitats-socials',
  '/equip',
  '/contacte',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  ES_PATHS.forEach((path, i) => {
    entries.push({
      url: `${BASE}/es${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: {
          es: `${BASE}/es${path}`,
          ca: `${BASE}/ca${CA_PATHS[i]}`,
        },
      },
    });
  });

  return entries;
}
