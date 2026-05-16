# Brick Breaker (Instructional Build Log)

This README is designed for beginners and for your AI talk. It shows the thinking process, the exact question flow, and how those answers became a working browser game. Built with `GPT-5.3-Codex`

## What we built

A playable neon-style Brick Breaker game in the browser with:

- Keyboard controls (`←` / `→` and `A` / `D`)
- Main menu screen
- 5 starting lives
- Endless progression (no final “you win” ending)
- Difficulty that scales via:
  - faster ball speed over levels
  - tougher/more complex brick layouts over levels
- Simple sound effects
- Game-over options:
  - Retry current level
  - Start over from level 1

Core files:

- `index.html`
- `style.css`
- `script.js`

## Why this is a good beginner example

This build started from a short idea, not technical specs. The AI asked structured questions, then translated those answers into code. That is the key lesson: **you can start with intent, not expertise**.

---

## Prompt and Question Flow (full transcript path)

### 1) Initial user prompt

> I want to make a brick breaker game in a web browser. I don't know how to make any games. So ask me the questions that you would need for me to help you get an idea of how I would like the game to be created.

### 2) AI clarifying questions (Round 1)

**Q: Game Style**
- Classic arcade (simple and fast)
- Modern with power-ups
- Puzzle-like levels

**User answer:** Classic arcade (simple and fast)

**Q: Difficulty**
- Easy
- Medium
- Hard

**User answer:** “I would like to start easy and get more difficult.”

**Q: Visuals**
- Minimal clean look
- Retro pixel vibe
- Neon/glow style

**User answer:** Neon/glow style

**Q: Build Path**
- Step-by-step teaching
- I build it first, then explain
- Half and half

**User answer:** I build it first, then explain

### 3) AI clarifying questions (Round 2)

**Q: Controls**
- Mouse movement
- Keyboard arrows / A-D
- Both mouse and keyboard

**User answer:** Keyboard arrows / A-D

**Q: Game Rules**
- 3 lives
- 5 lives
- Unlimited (practice mode)

**User answer:** 5 lives

**Q: Progression**
- Ball gets faster each level
- Harder brick layouts each level
- Both speed and layouts

**User answer:** Both speed and layouts

**Q: Audio**
- Yes, simple effects
- No, visuals only for now
- Yes, effects + background music

**User answer:** Yes, simple effects

### 4) AI clarifying questions (Round 3)

**Q: Device**
- Desktop/laptop browser
- Phone browser
- Both desktop and phone

**User answer:** Desktop/laptop browser

**Q: Run Length**
- Quick (2–5 minutes)
- Medium (5–10 minutes)
- Long (10+ minutes)

**User answer:** Medium (5–10 minutes)

**Q: Win Condition**
- Clear 3 levels
- Reach a target score
- Endless mode (no final win)

**User answer:** Endless mode (no final win)

### 5) Final scope lock-in from user

AI asked:
1. Do you want power-ups in v1?
2. Main menu or jump straight into gameplay?
3. On life loss at game over, retry or start over?

**User answers:**
1. No
2. Yes, there should be a cool main menu screen
3. Let the user retry or start over

---

## How those answers became implementation

1. **Set a minimum viable scope**
   - Single game mode, no power-ups, desktop-first.
2. **Build the screens first**
   - Main menu overlay
   - Gameplay canvas
   - Game-over overlay with two actions
3. **Implement game objects**
   - Paddle, ball, brick grid, HUD (score/lives/level)
4. **Implement controls and loop**
   - Keyboard input (`←` / `→`, `A` / `D`)
   - Update + render loop via `requestAnimationFrame`
5. **Add progression**
   - Increase ball speed per level
   - Increase brick pattern complexity and durability
6. **Add user-friendly game-over flow**
   - Retry same level
   - Start over from level 1
7. **Add polish**
   - Neon/glow visual style
   - Simple synthesized hit/loss/level-up tones

---

## Recreate this game from scratch (teaching steps)

Use this sequence in an instructional video:

1. Start with a plain-language idea.
   - Example: “Make a browser brick breaker.”
2. Ask AI to gather requirements with questions.
3. Answer only design choices (style, controls, difficulty, restart behavior).
4. Let AI generate a first working version.
5. Run it and play-test quickly.
6. Confirm if it matches intent.
7. Then ask for a breakdown/explanation of code sections.

This keeps beginners focused on **decision-making and iteration**, not memorizing syntax.

---

## Running the game

Open `index.html` in a browser.

If needed from terminal:

```bash
cd games/brick-breaker
open index.html
```

## Suggested follow-up improvements (optional for later lessons)

- Mobile touch controls
- Pause/resume
- High score save (localStorage)
- Accessibility settings (reduced effects, larger paddle)
- Multiple visual themes
