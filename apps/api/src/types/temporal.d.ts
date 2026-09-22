import type { Temporal as TemporalNamespace } from '@js-temporal/polyfill';

declare global {
  var Temporal: typeof TemporalNamespace;
}

export {};