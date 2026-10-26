# SCOPE — TWC Content Studio (YouTube Automation Dept)

## In scope (MVP, Phase 1 — approx 6–8 weeks, 2–3 devs)
1. Auth, teams, roles, per-channel permissions
2. Channels + platform accounts (YouTube OAuth first)
3. Script Board: idea → AI script → versions → approval
4. Scene breakdown from script (visual prompt, narration, on-screen text, duration)
5. Clip pipeline: stock footage (Pexels/Pixabay) + TTS + Whisper captions + music → FFmpeg render (9:16)
6. Google Drive storage integration and folder structure
7. SEO generator (title/description/tags/hashtags/thumbnail text) + score
8. Policy checklist engine (rules registry + AI review) with PASS/WARN/BLOCK
9. Kanban pipeline + task assignment + daily/weekly quotas per member
10. Manual-approve then publish to **YouTube** (Shorts) with scheduling

## Phase 2 (weeks 9–14)
1. AI QA Reviewer with issue timestamps + auto-fix loop
2. Publishers: TikTok, Instagram Reels, Facebook Reels (official APIs), Snapchat manual pack / API if available
3. Per-platform caption/hashtag adaptation
4. AI-generated clips provider (pluggable), image-to-video
5. Originality checks (self-similarity, perceptual hash, music check)

## Phase 3 (weeks 15+)
1. Analytics pull + winners/losers + feedback into prompts
2. Trend Radar, Competitor Tracker, Hook Lab/A-B testing
3. Repurpose Engine (long → shorts), Series Engine
4. Account Health dashboard, comment assistant
5. Notifications (WhatsApp/Slack), mobile app if needed

## Out of scope (for now)
- Guaranteeing views/virality (nobody can; we maximize odds)
- Botting, fake engagement, view/like buying, mass spam accounts
- Re-uploading other people's videos or scraping/reusing copyrighted footage
- Live streaming, long-form editing suite, in-browser timeline editor

## Key rules baked into the design
- **Originality first:** every video needs unique script, unique narration and meaningful variation. YouTube's inauthentic/mass-produced content policy targets templated, repetitive output — the engine must flag channels that look "same-y".
- **AI disclosure:** realistic synthetic content must carry the platform's AI/altered-content label — automated in the publisher.
- **Copyright:** only stock with commercial license, own footage, or AI output; music from licensed library.
- **Human in the loop:** final approval step is mandatory before publish (can be relaxed per channel later, at the owner's risk).

## Deliverables
- Working web app (admin + team UI), queue workers, Drive integration
- Pipeline from idea to published YouTube Short
- Policy Registry with initial rule set (verified date shown)
- Documentation: README, API/env setup, user guide for team

## Acceptance criteria (MVP)
- One user can create a channel, generate a script, get a rendered 9:16 video with voice + captions, see SEO + policy report, approve, and publish to YouTube from the tool
- A manager can assign 2 videos/day to a member and see completion vs quota
- All assets saved in the correct Drive folder; no manual file handling
- A failed job can be retried per scene without redoing the whole video

## Risks & dependencies
| Risk | Mitigation |
|------|-----------|
| Platform policies change often | Policy Registry + "last verified" date + monthly review task |
| TikTok / Snapchat API access limits (app audit, restricted posting) | Apply early; manual publish pack fallback |
| YouTube API quota (uploads consume large quota units) | Request quota extension; schedule uploads |
| AI video generation cost / GPU needs | Pluggable providers; start with stock + images |
| "Templated" channels flagged as inauthentic content | Variation engine, originality score, human review |
| Same video on many platforms = low reach | Per-platform edits, staggered posting, different hooks/captions |
| Token security (OAuth for many accounts) | Encrypted storage, least-privilege scopes, audit log |

## Decisions (answered)
1. **Channels:** owner adds channels himself; tool also ships a "Channel Idea Suggester" (niche, language, competition, policy risk). Starter suggestions are in the table below.
2. **Voice:** TWC's own TTS tool as default provider, ElevenLabs as the premium provider (per-channel setting). Both sit behind the same pluggable TTS interface.
3. **AI clips:** Google Flow. Flow has no confirmed public API, so MVP uses an assisted flow: tool generates a ready scene prompt (+ reference images, aspect ratio, duration) -> team generates in Flow -> uploads clip to the scene's Drive folder -> tool detects it and continues the pipeline. If Google exposes Veo via API (Gemini API / Vertex), swap in an automatic provider later without changing the pipeline. Verify current Flow/Veo access and limits before build.
4. **Languages:** multi-language from day one. Language is a channel property; scripts, TTS voice, captions, SEO and policy checks all run per language. Translation/localization of an approved script into other channels' languages is a built-in action (adapted, not literal, to keep each version original).
5. **Hosting:** Hostinger. Shared hosting cannot run queue workers, FFmpeg renders or Horizon reliably. Needs a Hostinger **VPS** (min. 4 vCPU / 8 GB RAM; more for heavy rendering) or split: web app on Hostinger, render workers on a separate VPS. Drive is the permanent storage; the server is only a render cache.
6. **Approval:** owner or manager (role "Manager"). One approver is required before publish; configurable per channel.
7. **Manual Flow + CapCut editing:** generation (Flow) and final editing (CapCut) stay manual and human-driven. The tool becomes the control center around them, not a replacement:
   - **Export "Edit Pack" per video** (to Drive): script, scene list with timings, Flow prompts, voiceover audio, SRT/word-level captions, music suggestion, on-screen text list, brand kit, SEO draft.
   - **Editor uploads** raw Flow clips and later the final CapCut export into the video's Drive folder. Tool auto-detects the upload (watched folder or "Mark as uploaded" button) and moves the task on.
   - **Auto-render stays optional:** FFmpeg render is only a fallback or for simple channels. CapCut is the default finishing step.
   - **QA, SEO, policy and publish run on the final CapCut export**, so the Reviewer checks what will actually go live.
   - New pipeline statuses: `CLIPS_REQUESTED` (waiting on Flow) -> `CLIPS_UPLOADED` -> `IN_EDITING` (CapCut) -> `FINAL_UPLOADED` -> `AI_QA`. Each has an owner, due date and quota counting.
   - Fix loop becomes: QA finds issues with timestamps -> task returns to editor as a checklist ("00:07 caption cut off", "00:14 audio too low") -> editor re-exports -> re-QA.
   - Effect on server: no heavy render workload in the default flow, so a smaller Hostinger VPS is enough (QA frame/audio analysis is light).

## Starter channel suggestions (faceless, multi-language friendly)
| Niche | Why | Watch out |
|-------|-----|-----------|
| Facts / "did you know" explainers | Easy to script, easy to localize | Needs real research, vary format |
| AI tools & tech tips | High CPM, steady trends | Fast-changing, verify claims |
| Personal finance / money tips | High CPM | No guaranteed-profit claims |
| Cars (extend Car Fusion) | Existing asset | Footage must be licensed/original |
| History & mysteries (short stories) | Strong retention | Label AI visuals, avoid fake "real footage" |
| Language learning (phrases) | Naturally multi-language | Needs native review per language |
| Health/herbal wellness (links to Niwali) | Brand synergy | Strict health-claim policies; no medical claims |
| Motivation / stories | Wide reach | Most saturated; originality risk |

## Remaining open questions
1. Which languages exactly (English, Urdu, Japanese, Spanish, Arabic...)?
2. How many channels and videos/day at launch?
3. Hostinger plan: which VPS tier is available?
(Flow generation stays manual, because the team also edits in CapCut. See decision 7.)
