'use client';

import { Magnetic } from './Magnetic';

export function PrintButton() {
  return (
    <Magnetic>
      <button type="button" className="btn btn-ghost" onClick={() => window.print()} data-track="resume-print">
        Print
      </button>
    </Magnetic>
  );
}
