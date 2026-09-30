# Rules: English voice-over scripts for Bäverbutiken's winning videos (Beaver Store, worldwide)

Read `REGLER-ANNONS.md` and `docs/copy-regler.md` first — every rule there applies.

## What you get and what you write

- Input: the Swedish SRT of one video (`transkript/<file>.srt`, transcribed locally with
  Whisper — it can mishear words; the video's product and the English product page tell you
  what was really said).
- Output: `manus-en/<file>.srt` — the English script with **exactly the same number of cues,
  the same cue numbers and the same start/end times**. The dubbing tool
  (`pipeline/omdubb/elevenlabs-omdubb.mjs`) reads one audio line per cue and fits it to that
  cue's piece of film, so a cue must never move or merge.

## Length is the hard rule

Each English cue must be spoken in about the same time as the Swedish one. Aim for **the same
number of syllables or fewer** (English is usually a little shorter — use that room, never
fill it). A cue that is 30 % longer than the Swedish will be sped up or cut; rewrite it
shorter instead.

## Content

- Same meaning, same order, same hook. You translate a winner, you do not rewrite it.
- Speakable English: short words, contractions, no brackets, no symbols. Write numbers the way
  they are said ("four hundred twenty D", "ten seconds", "two point five meters").
- Prices in kronor are never spoken. Replace the price cue with the product's benefit from the
  same video, or with a short neutral line that fits the time ("Grab it while it's in stock.").
  A percentage ("forty percent off") may stay only if the Swedish says it.
- No Klarna, no "free shipping within Sweden" (say "free shipping"), no store name, no
  Swedish dates or holidays.
- Whisper transcribes on-screen word captions too; if a cue is clearly caption text and not
  speech, keep it — the cue is still spoken in the Swedish video.
- A cue that is empty or only music in Swedish stays empty.

## SRT format

```
1
00:00:00,000 --> 00:00:02,340
Dull knives?

2
00:00:02,340 --> 00:00:04,100
Sharp in ten seconds.
```

UTF-8, one blank line between cues, no trailing spaces. Copy the time lines from the Swedish
file character for character.
