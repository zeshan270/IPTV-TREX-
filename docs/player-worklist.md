# Player Improvement Worklist

Last updated: 2026-04-15

## 1) Benchmark
- [x] Defined benchmark dimensions and quality gates.
- [x] Mapped current player features to competitor-style feature buckets.

## 2) Auflistung (Prioritized Backlog)

### P0 — Stability first
- [x] Default Fast-Zap mode to OFF (stability-first default).
- [ ] Add audio-track language preference fallback (de/en/default).
- [ ] Add automatic retry budget telemetry (client-side counters).

### P1 — UX confidence
- [x] One-click stream repair action in player UI.
- [x] Optional playback health overlay.
- [ ] Add explicit “Audio repariert / Track gewechselt” toast feedback.

### P2 — Performance polish
- [x] Throttled time UI updates to reduce re-render pressure.
- [x] Live playback excludes position persistence interval.
- [ ] Add preconnect strategy only when Fast-Zap is ON.

## 3) Auflistung abarbeiten (Execution in this iteration)
- [x] Implemented benchmark + worklist docs.
- [x] Set Fast-Zap default to OFF to reduce bug surface in production.
- [x] Kept new recovery tools available but user-controlled.

## 4) Push
- [ ] Push to Git remote and deploy from updated repository.

> Note: push/deploy depends on repository access and environment connectivity.

