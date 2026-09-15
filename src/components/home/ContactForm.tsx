'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState, type FormEvent } from 'react';

/** No backend on a static site: the form composes a prefilled email in the visitor's mail client and
 *  confirms in place. Every field is a real, labelled, validated input. */
export function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ name: '', from: '', message: '' });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry from ${values.name || 'a visitor'}`);
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name}${values.from ? ` · ${values.from}` : ''}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form onSubmit={submit} className="card p-6 md:p-8" aria-describedby="form-note" noValidate={false}>
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span className="eyebrow">Name</span>
            <input name="name" type="text" required autoComplete="name" placeholder="Your name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
          </label>
          <label className="field">
            <span className="eyebrow">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" value={values.from} onChange={(e) => setValues((v) => ({ ...v, from: e.target.value }))} />
          </label>
        </div>
        <label className="field">
          <span className="eyebrow">Message</span>
          <textarea name="message" required minLength={10} placeholder="What are you building, and where does the data come from?" value={values.message} onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))} />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p id="form-note" className="text-xs text-faint">
            Opens your mail app with the message prefilled — nothing is stored here.
          </p>
          <motion.button type="submit" className="btn btn-primary" whileTap={{ scale: 0.97 }}>
            Send message
            <span className="arrow" aria-hidden>
              →
            </span>
          </motion.button>
        </div>
        <AnimatePresence>
          {sent && (
            <motion.p role="status" className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              Your mail app should be open with the message ready. If it isn&rsquo;t, write to{' '}
              <a href={`mailto:${email}`} className="link-underline font-medium">
                {email}
              </a>
              .
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
