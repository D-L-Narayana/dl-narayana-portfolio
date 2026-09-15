import type { Metadata } from 'next';
import { Contact } from '@/components/home/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with D L Narayana for data engineering, full-stack or AI product work.',
  alternates: { canonical: '/contact/' },
  openGraph: { title: 'Contact — D L Narayana', url: '/contact/' },
};

export default function ContactPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Contact full />
    </div>
  );
}
