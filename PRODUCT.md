# TWC Content Studio — Product Brief

## Product name
TWC Content Studio

## Department
YouTube Automation Department

## Goal
Give TWC a controlled, scalable system to create, review, approve, and publish original YouTube Shorts across multiple channels and languages.

## Target users
- Owner
- Managers
- Scriptwriters
- Editors
- Voiceover / TTS operators
- QA reviewers
- Publishers

## Core value
Turn an idea into an approved, policy-checked, SEO-ready YouTube Short while keeping humans in control of quality, originality, copyright, and publishing.

## MVP features
1. Auth, teams, roles, and per-channel permissions
2. Channels and platform accounts, with YouTube OAuth first
3. Script Board: idea, AI script generation, versions, and approval
4. Scene breakdown from approved scripts
5. Clip pipeline using stock footage, TTS, Whisper captions, music, and optional FFmpeg rendering
6. Google Drive integration with automatic folder structure
7. SEO generator for titles, descriptions, tags, hashtags, and thumbnail text
8. Policy checklist engine with PASS, WARN, and BLOCK results
9. Kanban pipeline, assignments, and daily/weekly quotas
10. Manual approval and scheduled YouTube Shorts publishing

## Phase 2 features
- AI QA Reviewer with issue timestamps and auto-fix loop
- TikTok, Instagram Reels, and Facebook Reels publishers
- Snapchat manual publish pack, or API support if available
- Per-platform captions and hashtags
- Pluggable AI-generated clip providers and image-to-video
- Originality checks: self-similarity, perceptual hash, and music checks

## Phase 3 features
- Analytics, winners/losers, and prompt feedback
- Trend Radar, Competitor Tracker, Hook Lab, and A/B testing
- Repurpose Engine and Series Engine
- Account Health dashboard and comment assistant
- WhatsApp/Slack notifications and possible mobile app

## Explicitly out of scope
- Guaranteeing views or virality
- Botting, fake engagement, buying views or likes, or spam accounts
- Re-uploading, scraping, or reusing other people's copyrighted videos
- Live streaming
- Long-form editing suite
- In-browser timeline editor

## Non-negotiable principles
- Originality first
- AI disclosure where required
- Copyright-safe assets only
- Mandatory human approval before publishing
- Per-language adaptation, not literal translation
- Manual Flow generation and CapCut editing remain human-driven

## MVP acceptance criteria
- A user can create a channel, generate a script, receive a rendered 9:16 video with voice and captions, view SEO and policy reports, approve it, and publish to YouTube
- A manager can assign two videos per day to a member and see completion versus quota
- All assets are saved in the correct Drive folder without manual file handling
- A failed scene or job can be retried without redoing the whole video
