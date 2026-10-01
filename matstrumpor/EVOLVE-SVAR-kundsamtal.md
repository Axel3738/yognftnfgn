# Evolve-botens svar om kundsamtalen (2026-10-01)

Frågan står i `EVOLVE-FRAGOR-kundsamtal.md`. Svaret klistrades in av Axel
samma dag. `[Cn]`/`[Dn]` är botens egna källhänvisningar.

## Vad vi gör med svaret

| Del | Vad Evolve säger | Vad som ändrats |
|---|---|---|
| Frågorna | Rätt innehåll, fel form: kursen vill ha samtal, inte frågeformulär. Öppna casual, fråga "hur hittade du oss? vad letade du efter?" och låt kunden prata så länge det går [D1][D2]. Inga skriptade eller ledande frågor. Våra tre är ämnen att styra mot, inte en checklista | `matstrumpor/ringlista.mjs` → `MANUS.start` är Evolves öppningsfråga och står först i varje samtal; frågorna heter nu "Ämnen att styra mot" och är kortade till ett andetag; två regler tillagda (inte checklista, inga ledande frågor) |
| Invändningsfrågan | "Nästan inte köpt" är rätt instinkt, men ingen källa har en fråga som säkert ger den riktiga invändningen. Det öppna samtalet är det som fångar det oväntade (Spencers ölmagar i stället för gravida [C6]) | Behålls som ämne, inte som första fråga |
| Återköparna | "Vem fick dem och hur reagerade hen" är rätt kärna — gåvodynamiken är vinkeln | Oförändrat |
| Nya kunder | "Vad minns du av annonsen" testar om hooken landar eller om de minns något annat | Oförändrat |
| Belöningen | Presentkort/butikskredit är rätt form (Spencer [C7]: aldrig återbetalning). Att hålla inne med den tills efter samtalet är inte diskuterat i communityt, men rimligt. Varning: ett kort som gäller 12 månader kan kännas dött för en säsongsprodukt | 200 kr till **31 december**, alltså inom säsongen när nästa köp ändå sker — inte ett år. Nämns aldrig i samtalet, skickas skriftligt efteråt (`presentkort.mjs`) |
| Anteckningar → annonskoncept | daemns pipeline [C2]: råa anteckningar in → lista på problem och önskningar ut → prioritera på marknadsstorlek och hur stark önskan är → avatarer/vinklar. Spencer [C3]: bygg manus av kundernas egna ord. Gregs varning [C1]: leta efter det GEMENSAMMA, bygg EN avatar, inte en mikro-avatar per invändning | Sammanfattningen efter samtalen görs så (se nedan) |
| Mer att läsa | Shaun länkade en kursresurs om kundsamtalsfrågor när .Gulfam frågade samma sak [C5] | Axel letar upp den i Evolve om han vill; inte gjort |

## Så skrivs sammanfattningen när Axel klistrat in anteckningarna

1. Alla citat ord för ord först, grupperade på **önskan** (vad de ville uppnå)
   och **invändning** (vad som nästan stoppade), med kundens grupp (återköp/ny)
   och annonsen hen kom från.
2. Det gemensamma: den önskan och den invändning som återkommer hos flest.
   Räkna. En önskan som bara en kund nämner är en anteckning, inte en vinkel.
3. EN avatar ur det gemensamma (Greg), inte en per samtal. Jämför mot
   `products/matstrumpor/dna.md` → Avatarer: bekräfta, ändra eller stryk.
4. Koncept ur kundernas ord: hook = ett citat, inte en omskrivning. Tre-
   frågorstestet i `docs/copy-regler.md` på varje rad.
5. Landar i `products/matstrumpor/kundsamtal-<datum>.md` + avatarerna i
   `dna.md`; koncepten går in i nästa `/matstrumporkungen`-rond som
   `kalla=kundsamtal`.

## Svaret ordagrant

1. Your call questions are solid and align with the community's approach — but the course material emphasizes conversational flow over structured Q&A, and only one of your three sub-questions has a direct answer in the sources.

   1. Call question design — right questions, but let the conversation drive

   The course material is explicit on approach: open the call casually, ask "how'd you find out about us? What were you looking for?" and then let them talk as long as possible [D1][D2]. The documents warn against scripted or leading questions — "avoid scripted questions like 'What's your favorite color?' or 'What are you in pain about?'" [D2]. Your planned questions are good in content, but the framing matters more than the list. Treat them as topics to steer toward naturally, not a checklist.

   Your "whether anything almost stopped them from buying" question is the right instinct for objections — but no source confirms a specific question that reliably surfaces the real objection vs. a polite answer. What the sources do support: the principle that open-ended, conversational questions surface non-obvious motivations better than structured ones. Spencer's canonical example — surveys revealing overweight men with beer bellies instead of the expected pregnant women — shows the value of letting customers tell you something you didn't think to ask [C6]. Shaun's approach is to look for commonalities across top purchasers: same struggles, same feelings [C1]. Greg's insight is the cautionary tale — he found customers bought for different reasons but all wanted the same outcome, and he'd been addressing too many problems, creating "micro-avatars" instead of one clear avatar [C1].

2. For your repeat-buyer group specifically, asking "who received the socks and how they reacted" is smart — it surfaces the gifting dynamic and recipient response, which is your core angle. For first-time buyers, "what they remember from the ad" tests whether your hook is actually landing or whether they're remembering something else entirely.

   Shaun linked to a course resource on customer call questions when another member (.Gulfam) asked the exact same question about what to ask on calls [C5] — worth checking that resource for additional question framing.

   2. Withholding the reward + gift card form — partial answer only

   Spencer directly addresses incentive form: "I wouldn't offer them a 10% refund. I would just offer them like 10% off on their next order or maybe store credit or maybe some kind of a gift card or something like that. The refund's a little bit weird." [C7]. So a gift card or store credit is the endorsed form — you're on the right track.

   But no source covers whether to withhold the incentive until after the call to keep answers honest. Your instinct is reasonable — mentioning a reward upfront could prime them to be agreeable — but the community hasn't discussed this specific timing question. And no source addresses whether a gift card suits a seasonal/once-a-year purchase product. Given your ~1% repeat rate with a ~3-week median between purchases for repeat buyers, a gift card expiring in 12 months might feel like a dead reward. Consider whether a direct thank-you (cash-equivalent like a bank transfer or a small physical gift) would feel more genuine — but that's reasoning, not sourced guidance.

   3. Turning 15 call notes into ad concepts — the workflow exists but isn't fully documented in these sources

   Two relevant approaches from the community:

3. daemn's Claude pipeline [C2]: Feed raw customer feedback (who they are, what they wanted, problems) into Claude to extract a clear list of problems and desires, then cross-reference with TAM and desire intensity to produce a prioritized list of avatars/angles. This is the closest thing to a documented "notes → concepts" workflow — and it's designed for exactly your scenario (converting unstructured customer language into testable angles).

   Spencer's sub-avatars-to-angles process [C4]: Spencer confirms that sub-avatars become angles, and they track angles and concepts in the Growth guide. New videos in the "how to make ads" section cover this. His core principle: "You should really just be pulling from your research and using your customers' words to put everything together into a script" [C3]. The whole point of finding avatars is to find angles that are relatable [C3].

   The broader workflow members reference (from C8's discussion): research → identify sub-avatars → derive angles → test → feedback loop. After a winner: iterate with sniper testing on hooks, persona, visuals, format.

   What's not documented: no source describes clustering verbatim quotes by objection/recipient specifically. daemn's Claude approach is the closest — it takes raw input and outputs prioritized problems/desires, which you'd then map to angles. Given you're doing 15 calls, you likely don't have enough volume for robust statistical clustering anyway. The better play: dump all notes into Claude using daemn's framework, identify the 2-3 strongest recurring desires/objections, and build ad concepts around those using the customers' exact language [C2][C3].

4. One caution from Greg's experience [C1]: don't try to address every objection you hear. Look for the commonalities — the single desire or struggle that shows up across multiple callers — and build one clear avatar around that rather than fragmenting into micro-avatars.
