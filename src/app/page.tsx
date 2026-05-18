import { redirect } from 'next/navigation';

// Root catch-all: redirect to the default locale.
// The next-intl middleware handles this in most cases;
// this page is a safety net for when it doesn't.
export default function RootPage() {
  redirect('/es');
}
