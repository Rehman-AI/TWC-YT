# TWC Content Studio — YouTube Automation Department

A multi-channel, multi-platform short-video production and publishing tool.
Built for The Web Concept (TWC). Stack: Laravel (API + admin), queue workers, FFmpeg, AI services, Google Drive storage.

---

## 1. Vision

One place where a team can:
1. Manage many **Channels** (and their **Pages/Accounts** per platform)
2. Write **scripts** (AI-assisted) per channel
3. Turn scripts into **scenes → clips → finished video**
4. Run an **SEO + Policy + Originality check** before upload
5. Run an **AI QA review** of the finished video (find mistakes → auto-fix → re-review)
6. **Publish** to YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, Snapchat Spotlight
7. Track **performance analytics** and feed learnings back into scripting
8. Manage the whole thing as a **team** (tasks, quotas, roles, approvals)

---

## 2. Modules

| # | Module | Status |
|---|--------|--------|
| 1 | Channels & Pages | MVP |
| 2 | Scripting | MVP (build first) |
| 3 | Scene/Clip Generation + Video Assembly | MVP |
| 4 | SEO & Policy Engine | MVP |
| 5 | AI Video QA ("Reviewer") | Phase 2 |
| 6 | Multi-platform Publisher | Phase 2 |
| 7 | Project / Task Management | MVP |
| 8 | Team, Roles & Permissions | MVP |
| 9 | Google Drive Storage | MVP |
| 10 | Analytics & Growth Loop | Phase 3 |

### Module 1 — Channels & Pages
- Channel = a niche/brand (e.g. Car Fusion, Reel). Has: niche, language, voice, style guide, posting schedule, target platforms.
- Each channel has **Pages/Accounts** per platform (YouTube channel, TikTok account, IG, FB page, Snapchat).
- Per channel: brand kit (fonts, colors, intro/outro, watermark), tone, banned words, recurring series.
- OAuth connection per account; tokens stored encrypted.

### Module 2 — Scripting
- Inside each channel/page: a **Script Board** (idea → draft → approved).
- Idea generation: trending topics (YouTube/Google Trends), competitor analysis, saved ideas.
- AI script writer using channel style guide: hook (first 2 sec), body, CTA, loop ending.
- Variants: A/B hooks, different lengths (15/30/45/60 sec).
- Script is structured: scenes[] with narration text, visual description, on-screen text, duration.
- Versioning, comments, approve/reject flow.

### Module 3 — Scenes → Clips → Video
Flow per scene:
1. Visual source (configurable per channel):
   - Stock footage (Pexels / Pixabay APIs — free, commercial use)
   - AI-generated clips (local open models or paid APIs — pluggable provider)
   - Own uploaded footage from Drive
   - Image + motion (Ken Burns) from AI/stock images
2. Voiceover: pluggable TTS (free: Piper/Kokoro/Edge-TTS; paid: ElevenLabs etc.)
3. Captions: Whisper word-level timestamps → animated captions
4. Music: royalty-free library with per-channel playlists
5. Assembly: FFmpeg (or Remotion) templates → 9:16 render, plus 16:9 option
6. Output: MP4 + thumbnail + metadata saved to Drive

Clip-by-clip: every scene is an independent job — regenerate any single clip without redoing the whole video.

**Default workflow (manual Flow + CapCut):** the tool exports an *Edit Pack* (script, scene prompts for Flow, voiceover, captions, on-screen text, brand kit) to Drive. The team generates clips in Google Flow, edits in CapCut, and uploads the final export back to the video's Drive folder. The tool then runs SEO, policy and AI QA on that final file. FFmpeg auto-render remains an optional fallback.

### Module 4 — SEO & Policy Engine (automated)
**SEO (per platform):**
- Keyword research: YouTube autocomplete, Google Trends, competitor titles/tags
- Generates: title (A/B options), description, hashtags, tags, pinned comment, thumbnail text, first-line hook, chapters (long form)
- Platform-specific variants (YouTube vs TikTok vs IG caption styles)
- Best posting time suggestion from own analytics
- Score (0-100) with explanation; must pass threshold to publish

**Policy / Reuse / Originality checks:**
- YouTube **Inauthentic Content** policy (mass-produced / repetitive content), reused content, AI disclosure ("altered or synthetic content" label), copyright, community guidelines, ad-friendly (advertiser) guidelines
- Checks implemented as a **rules checklist** + AI review against the policy text (policy text refreshed periodically — see Policy Registry)
- Originality: transcript similarity vs our own previous videos (avoid repetitive templates), visual fingerprint (perceptual hash) vs stock/known sources, music ID check
- Uniqueness score; flags "template sameness" across a channel's last N videos
- Output: PASS / WARN / BLOCK with exact reasons and fix suggestions

**Policy Registry:** admin-editable table of platform rules with "last verified" date, so the engine stays current without code changes.

### Module 5 — AI Video QA ("Reviewer")
After render, before upload:
- Extract frames + audio + transcript
- Checks: audio clipping/silence, caption sync, text overflow, black frames, low-res clips, hook strength in first 2 sec, pacing (cuts per second), script-vs-video mismatch, factual claims flagged, banned words, watermark visible, aspect ratio safe zones
- Output: list of issues with timestamps + severity
- **Auto-fix loop:** fixable issues (re-render captions, normalize audio, swap a bad clip, trim dead air) are sent back to the clip pipeline, then re-reviewed (max N loops), then goes to human approval
- Everything logged in a review history

### Module 6 — Multi-platform Publisher
- Platforms: YouTube (Shorts + long), TikTok, Instagram Reels, Facebook Reels, Snapchat Spotlight
- Uses **official APIs** wherever available; queue-based scheduling with retries
- Per-platform adaptation: caption length, hashtags, aspect ratio, duration limits, cover image
- Fallback "manual publish pack" (video + caption + checklist) for platforms without a usable API
- Staggered posting + slight metadata variation to avoid spam signals (and to stay inside policy)
- Post-publish: store URLs/IDs, pull stats

> Note: API access differs per platform (e.g. TikTok Content Posting API needs app audit; Snapchat has limited public posting API). See SCOPE.md → Risks.

### Module 7 — Project / Task Management
- **Pipeline board (Kanban):** Idea → Script → Scenes → Render → QA → Fix → Approved → Scheduled → Published
- Each video = a Task with owner, due date, priority, checklist, comments
- **Quota rule:** assign a team member N videos per day/week (e.g. 1 person → 2 videos/day); dashboard shows who is behind
- Auto task creation from approved scripts; auto status changes from pipeline events
- Notifications: email / WhatsApp / Slack (optional)

### Module 8 — Team & Roles
- Roles: Owner, Manager, Script Writer, Video Editor, Reviewer, Publisher, Viewer
- Per-channel access control
- Activity log / audit trail
- Per-member productivity stats

### Module 9 — Google Drive Storage
- Connect a Shared Drive/folder; auto folder structure: `Channel / YYYY-MM / VideoID / {script, clips, audio, render, thumbnail, final}`
- All assets referenced by Drive file IDs; local cache for rendering, cleanup after upload
- Storage-agnostic interface (can add S3/Wasabi later)

### Module 10 — Analytics & Growth Loop
- Pull views, retention, CTR, watch time, shares, follows per video/platform
- Winners/losers report: which hooks, topics, lengths, posting times work
- "Learn" step: feed top performers' patterns back into script prompts and SEO
- Experiments: A/B titles/thumbnails/hooks tracked to result

---

## 3. "Views like rocket" — extra features that actually help
1. **Hook Lab:** generate 5–10 hooks, score them, A/B test them
2. **Retention Predictor:** flags slow sections before publishing
3. **Trend Radar:** daily trending topics/sounds per niche, with "make this now" button
4. **Competitor Tracker:** watch top channels in each niche, alert on their breakout videos
5. **Series Engine:** turn a winner into Part 2/3, remix into other formats
6. **Repurpose Engine:** one long video → many shorts (with different cuts, not copies)
7. **Comment Assistant:** draft replies, pin questions → next video ideas
8. **Posting Calendar:** best-time scheduling, per-platform
9. **Account Health Dashboard:** strikes, limited-ads flags, shadowban indicators
10. **Idea Bank + Duplicate Guard:** never repeat a topic too soon

---

## 4. Suggested Tech Stack
- **Backend/Admin:** Laravel 11+, Filament (admin UI), Sanctum, Horizon + Redis queues
- **DB:** MySQL/PostgreSQL
- **Video:** FFmpeg (+ optional Remotion for template-driven motion graphics)
- **AI:** pluggable providers (Claude API for scripts/QA/SEO; Whisper for transcription; TTS/video-gen providers swappable)
- **Storage:** Google Drive API (service account) + local cache
- **Realtime:** Laravel Reverb / Pusher for pipeline progress
- **Frontend:** Filament/Livewire for MVP; Flutter or Vue later if needed
- **Infra:** Hostinger VPS for web + queue workers (shared hosting is not enough); GPU not required since AI clips come from Google Flow
- **Voice:** TWC in-house TTS (default) + ElevenLabs (premium), per-channel setting
- **AI clips:** Google Flow (assisted flow in MVP: prompt out, clip back via Drive; API provider later if available)
- **Languages:** multi-language per channel (script, voice, captions, SEO, policy)

---

## 5. Data Model (core tables)
`users, teams, roles` · `channels, accounts (platform OAuth)` · `ideas, scripts, script_versions, scenes` · `clips, assets (drive refs)` · `videos, renders` · `seo_reports, policy_rules, policy_checks` · `qa_reviews, qa_issues` · `publish_jobs, publications` · `tasks, task_assignments, quotas` · `analytics_snapshots` · `activity_logs`

---

## 6. Pipeline (state machine)
```
IDEA → SCRIPT_DRAFT → SCRIPT_APPROVED → SCENES_READY → CLIPS_GENERATED
→ RENDERED → SEO_POLICY_CHECK → AI_QA → (FIX loop) → HUMAN_APPROVAL
→ SCHEDULED → PUBLISHED → ANALYZED
```
Each arrow = queued job with retries, logs, and manual override.

---

## 7. Setup (to be filled when code starts)
```
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan horizon
```
Required env keys (planned): `GOOGLE_DRIVE_*`, `YOUTUBE_*`, `TIKTOK_*`, `META_*`, `SNAP_*`, `AI_PROVIDER_*`, `TTS_PROVIDER_*`, `PEXELS_KEY`.

---

See **SCOPE.md** for phases, deliverables, and risks.
