# TWC Content Studio — Build Tasks

## Phase 1 — Foundation
- [ ] Initialize web application repository
- [ ] Set up database schema and migrations
- [ ] Implement authentication
- [ ] Implement teams
- [ ] Implement roles
- [ ] Implement per-channel permissions
- [ ] Create admin and team UI layout
- [ ] Set up queue workers
- [ ] Set up environment configuration
- [ ] Set up logging and audit log

## Phase 2 — Channels and Drive
- [ ] Create channel CRUD
- [ ] Add channel settings: niche, language, TTS provider, approval rule
- [ ] Implement YouTube OAuth connection
- [ ] Encrypt and store OAuth tokens
- [ ] Implement Google Drive integration
- [ ] Create automatic Drive folder structure
- [ ] Implement asset upload and detection

## Phase 3 — Script Board
- [ ] Create video project from idea
- [ ] Implement AI script generation
- [ ] Save script versions
- [ ] Allow manual script editing
- [ ] Implement script approval flow
- [ ] Add language-aware script generation
- [ ] Add script-to-script localization action

## Phase 4 — Scenes and Clips
- [ ] Break approved script into scenes
- [ ] Generate visual prompt, narration, on-screen text, and duration per scene
- [ ] Add stock footage search through Pexels and Pixabay
- [ ] Implement TTS provider interface
- [ ] Add TWC TTS provider
- [ ] Add ElevenLabs provider
- [ ] Generate Whisper captions
- [ ] Add music selection from licensed library
- [ ] Build optional FFmpeg 9:16 render pipeline
- [ ] Generate Edit Pack export to Drive
- [ ] Detect Flow clip uploads
- [ ] Detect final CapCut export upload

## Phase 5 — QA, SEO, Policy
- [ ] Build AI QA Reviewer
- [ ] Add issue timestamps
- [ ] Create QA fix checklist
- [ ] Return video to editor for fixes
- [ ] Build SEO generator
- [ ] Generate title, description, tags, hashtags, and thumbnail text
- [ ] Add SEO score
- [ ] Create Policy Registry
- [ ] Add initial policy rules with last-verified dates
- [ ] Implement AI policy review
- [ ] Return PASS, WARN, or BLOCK result

## Phase 6 — Pipeline and Publishing
- [ ] Build Kanban pipeline
- [ ] Implement task assignment
- [ ] Implement daily and weekly quotas
- [ ] Show completion versus quota
- [ ] Implement approval workflow
- [ ] Implement YouTube Shorts scheduling
- [ ] Publish approved videos to YouTube
- [ ] Add automatic AI disclosure where required
- [ ] Implement failed job retries per scene
- [ ] Add publish audit log

## Phase 2 backlog
- [ ] AI QA auto-fix loop
- [ ] TikTok publisher
- [ ] Instagram Reels publisher
- [ ] Facebook Reels publisher
- [ ] Snapchat manual publish pack
- [ ] Per-platform caption adaptation
- [ ] Pluggable AI clip provider
- [ ] Image-to-video support
- [ ] Originality checks
- [ ] Perceptual hash checks
- [ ] Music copyright checks

## Phase 3 backlog
- [ ] YouTube analytics integration
- [ ] Winner and loser reports
- [ ] Feedback into prompts
- [ ] Trend Radar
- [ ] Competitor Tracker
- [ ] Hook Lab
- [ ] A/B testing
- [ ] Repurpose Engine
- [ ] Series Engine
- [ ] Account Health dashboard
- [ ] Comment assistant
- [ ] WhatsApp and Slack notifications
