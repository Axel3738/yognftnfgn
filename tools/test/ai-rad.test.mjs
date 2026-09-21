// Ren logik i tools/ai-rad.mjs — AI-raden på engelskspråkiga videor (CS-KLART punkt 27). Ingen ffmpeg här.

import test from 'node:test';
import assert from 'node:assert/strict';
import { aiInnehallUr, skaHaRad, forceStyle, srtText, subtitlesFilter, TEXT, ASS_HOJD, FONTSIZE_ASS, MARGINV_ASS, MARKNADER_MED_RAD, AI_INNEHALL } from '../ai-rad.mjs';

test('aiInnehallUr: briefens rad "AI content:" — person, voice, image only, none; svenska ord också; saknad rad = null', () => {
  assert.equal(aiInnehallUr('**AI content:** AI-generated person (HeyGen avatar) + AI voice'), 'person');
  assert.equal(aiInnehallUr('AI content: voice only (ElevenLabs), real footage'), 'rost');
  assert.equal(aiInnehallUr('AI content: image only — product animation from kie.ai stills'), 'bild');
  assert.equal(aiInnehallUr('AI content: none'), 'ingen');
  assert.equal(aiInnehallUr('AI-innehåll: AI-röst'), 'rost');
  assert.equal(aiInnehallUr('# Brief\n\nSomething else'), null);
  assert.equal(aiInnehallUr('AI content: hmm'), null);
});

test('skaHaRad: obligatorisk vid person/röst, frivillig vid bild/ingen, okänt ⇒ raden läggs på, --tvinga vinner', () => {
  assert.equal(skaHaRad('person').ja, true);
  assert.equal(skaHaRad('rost').ja, true);
  assert.equal(skaHaRad('bild').ja, false);
  assert.equal(skaHaRad('ingen').ja, false);
  assert.equal(skaHaRad(null).ja, true);
  assert.match(skaHaRad(null).skal, /behandlas som person/);
  assert.equal(skaHaRad('bild', { tvinga: true }).ja, true);
  assert.deepEqual(Object.keys(AI_INNEHALL), ['person', 'rost', 'bild', 'ingen']);
  assert.ok(MARKNADER_MED_RAD.includes('US') && MARKNADER_MED_RAD.includes('NZ') && !MARKNADER_MED_RAD.includes('NO'));
});

test('forceStyle + srtText + subtitlesFilter: liten vit text på svart halvgenomskinlig platta, centrerad, innanför både 4:5-beskärning och Reels-fält', () => {
  const s = forceStyle();
  assert.match(s, /^FontName=Liberation Sans,Bold=0,FontSize=5,PrimaryColour=&H00FFFFFF,BorderStyle=4,BackColour=&H70000000,Outline=1,Shadow=0,MarginV=44,MarginL=10,MarginR=10,Alignment=2$/);
  assert.match(forceStyle({ font: 'DejaVu Sans' }), /^FontName=DejaVu Sans,/);
  const hojd = FONTSIZE_ASS / ASS_HOJD;                 // ≈ 1,7 % av höjden
  const underkant = 1 - MARGINV_ASS / ASS_HOJD;          // ≈ 84,4 %
  assert.ok(hojd < 0.02, 'liten nog att inte störa');
  assert.ok(underkant <= 0.852 && underkant - hojd * 1.3 >= 0.823, 'innanför 4:5-beskärningen (≤ 85,2 %) och ovanför Reels bottenfält (≥ 82,3 %)');
  assert.equal(TEXT, 'Contains AI-generated content');
  assert.equal(srtText(), '1\n00:00:00,000 --> 99:59:59,000\nContains AI-generated content\n');
  assert.match(subtitlesFilter('/tmp/x/fil.ai-rad.srt'), /^subtitles=\/tmp\/x\/fil\.ai-rad\.srt:force_style='FontName=Liberation Sans/);
  assert.match(subtitlesFilter("C:/a'b.srt"), /subtitles=C\\:\/a\\'b\.srt/);
});
