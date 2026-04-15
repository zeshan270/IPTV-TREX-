# IPTV Player Benchmark (TiviMate / IPTV Smarters Pro / HotPlayer Baseline)

Last updated: 2026-04-15

## Objective
Build a player experience that is:
- faster on channel switch
- more stable on weak streams
- easier for non-technical users
- still clean and premium-looking

## Benchmark Dimensions

### 1) Startup & Zap Speed
- Time to first frame (TTFF)
- Time for channel up/down switch
- Recovery time after transient network failures

### 2) Playback Stability
- Buffer interruptions/hour
- Error recovery success rate
- Audio/video desync frequency

### 3) UX & Usability
- Number of clicks for common actions (audio, subtitles, aspect, stream retry)
- Remote-control friendliness (focus order, no dead ends)
- Visibility of state (buffering, recovery in progress, stream health)

### 4) User Safety & Confidence
- “One-click repair” behavior
- Transparent error messages
- Safe fallback defaults (no silent startup traps)

## Competitive Baseline (Feature Buckets)

| Bucket | Typical Premium Players | Current App Direction |
|---|---|---|
| Fast channel switching | Strong | Added Fast-Zap mode toggle |
| One-click stream recovery | Medium | Added `quickFixStream` |
| Playback diagnostics | Medium | Added optional health overlay |
| Audio fallback recovery | Varies | Added `recoverAudioTrack` |
| Simple, clean UI | Strong | Keep existing color theme and compact controls |

## Quality Gates Before “Best in Class” Claim
1. Fast-Zap OFF must remain stable across weak networks.
2. Fast-Zap ON must reduce perceived switch latency without raising fatal error rate.
3. “Stream reparieren” should recover typical audio/media glitches within one action.
4. No regression in base login/home/navigation flow.

