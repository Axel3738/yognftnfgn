/**
 * "Så kopplar du Claude" — tre steg med bilder, inne i Inställningar.
 *
 * Bilderna är inline-SVG, inte filer: appen har inga CDN:er och inga
 * bildtillgångar, och en skärmbild av Anthropics konsol hade varit fel inom
 * en månad. Ritningarna visar FORMEN på det handlaren letar efter — ett
 * adressfält, en knapp, ett fält — vilket är det som gör att man hittar
 * rätt, och de åldras inte när konsolen byter färg.
 *
 * `currentColor` överallt: ritningarna följer Polaris textfärg och fungerar
 * därför i både ljust och mörkt läge utan en egen palett.
 */

import { BlockStack, Box, InlineStack, Text } from "@shopify/polaris";
import type { Texts } from "../lib/texts";

/** Gemensam ram: samma storlek och luft för alla tre, så raden blir jämn. */
function Ritning({ children, titel }: { children: React.ReactNode; titel: string }) {
  return (
    <svg
      viewBox="0 0 220 132"
      width="100%"
      height="auto"
      role="img"
      aria-label={titel}
      style={{ display: "block", maxWidth: 260, color: "currentColor" }}
    >
      <title>{titel}</title>
      {children}
    </svg>
  );
}

/* Ett webbläsarfönster med adressfältet ifyllt och "API keys" i sidomenyn. */
function StegEtt({ titel }: { titel: string }) {
  return (
    <Ritning titel={titel}>
      <rect x="4" y="4" width="212" height="124" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      <line x1="4" y1="28" x2="216" y2="28" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      <circle cx="16" cy="16" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="28" cy="16" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="40" cy="16" r="3.5" fill="currentColor" opacity="0.35" />
      {/* Adressfältet — det handlaren ska skriva i */}
      <rect x="54" y="9" width="150" height="14" rx="7" fill="currentColor" opacity="0.1" />
      <text x="62" y="19.5" fontSize="8.5" fill="currentColor" opacity="0.85">console.anthropic.com</text>
      {/* Sidomenyn, med raden som ska klickas markerad */}
      <rect x="14" y="38" width="62" height="82" rx="5" fill="currentColor" opacity="0.06" />
      <rect x="20" y="46" width="42" height="5" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="20" y="58" width="50" height="5" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="16" y="68" width="58" height="16" rx="5" fill="currentColor" opacity="0.18" />
      <text x="22" y="79" fontSize="8" fill="currentColor" opacity="0.95" fontWeight="600">API keys</text>
      <rect x="20" y="92" width="36" height="5" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="20" y="104" width="46" height="5" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="86" y="44" width="116" height="6" rx="3" fill="currentColor" opacity="0.14" />
      <rect x="86" y="58" width="96" height="6" rx="3" fill="currentColor" opacity="0.14" />
      <rect x="86" y="72" width="108" height="6" rx="3" fill="currentColor" opacity="0.14" />
    </Ritning>
  );
}

/* Knappen "Create Key" och nyckeln som kommer fram, med en kopiera-ikon. */
function StegTva({ titel }: { titel: string }) {
  return (
    <Ritning titel={titel}>
      <rect x="4" y="4" width="212" height="124" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      <rect x="20" y="20" width="84" height="8" rx="4" fill="currentColor" opacity="0.2" />
      {/* Knappen */}
      <rect x="132" y="16" width="68" height="20" rx="10" fill="currentColor" opacity="0.85" />
      <text x="166" y="29.5" fontSize="9" textAnchor="middle" fill="var(--p-color-bg-surface, #fff)" fontWeight="600">
        Create Key
      </text>
      {/* Nyckeln som visas EN gång */}
      <rect x="20" y="56" width="180" height="26" rx="6" fill="currentColor" opacity="0.08" />
      <text x="30" y="72.5" fontSize="9" fill="currentColor" opacity="0.9" fontFamily="monospace">
        sk-ant-api03-•••••••••
      </text>
      {/* Kopiera-ikonen */}
      <rect x="166" y="62" width="12" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
      <rect x="171" y="66" width="12" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.95" />
      <rect x="20" y="96" width="140" height="6" rx="3" fill="currentColor" opacity="0.14" />
      <rect x="20" y="110" width="104" height="6" rx="3" fill="currentColor" opacity="0.14" />
    </Ritning>
  );
}

/* Appens eget fält med nyckeln inklistrad och Koppla-knappen. */
function StegTre({ titel, falt, knapp }: { titel: string; falt: string; knapp: string }) {
  return (
    <Ritning titel={titel}>
      <rect x="4" y="4" width="212" height="124" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      <rect x="20" y="20" width="76" height="7" rx="3.5" fill="currentColor" opacity="0.22" />
      <text x="20" y="48" fontSize="8.5" fill="currentColor" opacity="0.7">{falt}</text>
      {/* Fältet */}
      <rect x="20" y="54" width="180" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.6" />
      <text x="30" y="69.5" fontSize="9" fill="currentColor" opacity="0.9" fontFamily="monospace">
        ••••••••••••••••
      </text>
      {/* Knappen */}
      <rect x="20" y="92" width="74" height="22" rx="11" fill="currentColor" opacity="0.85" />
      <text x="57" y="106.5" fontSize="9" textAnchor="middle" fill="var(--p-color-bg-surface, #fff)" fontWeight="600">
        {knapp}
      </text>
    </Ritning>
  );
}

/**
 * Hela guiden. Visas i kortet "Koppla Claude" så länge butiken inte kopplat
 * någon nyckel — när den är kopplad är den bara i vägen.
 */
export function ClaudeGuide({ T }: { T: Texts }) {
  const g = T.settings.claude.guide;
  const steg = [
    { rubrik: g.step1, text: g.step1Body, bild: <StegEtt titel={g.step1} /> },
    { rubrik: g.step2, text: g.step2Body, bild: <StegTva titel={g.step2} /> },
    {
      rubrik: g.step3,
      text: g.step3Body,
      bild: <StegTre titel={g.step3} falt={T.settings.claude.label} knapp={T.settings.claude.save} />,
    },
  ];

  return (
    <BlockStack gap="400">
      <Text as="h3" variant="headingSm">{g.title}</Text>
      {steg.map((s, i) => (
        <InlineStack key={s.rubrik} gap="400" blockAlign="start" wrap>
          <div style={{ flex: "1 1 260px", minWidth: 220 }}>
            <BlockStack gap="150">
              <Text as="p" fontWeight="semibold">{`${i + 1}. ${s.rubrik}`}</Text>
              <Text as="p" tone="subdued">{s.text}</Text>
            </BlockStack>
          </div>
          <Box minWidth="220px">{s.bild}</Box>
        </InlineStack>
      ))}
      <Text as="p" variant="bodySm" tone="subdued">{g.footer}</Text>
    </BlockStack>
  );
}
