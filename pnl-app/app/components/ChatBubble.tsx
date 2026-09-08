/**
 * Chattbubblan nere till höger på alla sidor. Ren React + inline-stil (inte
 * Polaris) så att den ligger ovanpå sidan utan att bråka med layouten.
 * Historiken bor i komponenten — stängs panelen finns samtalet kvar tills
 * sidan laddas om. Inget sparas på servern.
 */

import { useEffect, useRef, useState } from "react";
import { useFetcher } from "@remix-run/react";
import type { Texts } from "../lib/texts";

type Msg = { role: "user" | "assistant"; content: string; actions?: Action[] };
type Action = { type: "set_cost"; product: string; variant: string; cost: number; tiers: number[]; label: string };

export function ChatBubble({ T }: { T: Texts }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const fetcher = useFetcher<{ ok: boolean; answer?: string; actions?: Action[]; message?: string }>();
  const listRef = useRef<HTMLDivElement>(null);
  const laddar = fetcher.state !== "idle";

  /* Svaret läggs i historiken när det kommer. Nyckeln på fetcher.data gör att
     samma svar inte läggs två gånger vid omrendering. */
  const senast = useRef<unknown>(null);
  useEffect(() => {
    if (!fetcher.data || fetcher.data === senast.current) return;
    senast.current = fetcher.data;
    const d = fetcher.data;
    setMsgs((m) => [...m, { role: "assistant", content: d.ok ? d.answer ?? "" : d.message ?? T.chat.failed(""), actions: d.ok ? d.actions : undefined }]);
  }, [fetcher.data, T]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, laddar, open]);

  const skicka = () => {
    const q = text.trim();
    if (!q || laddar) return;
    const nya = [...msgs, { role: "user" as const, content: q }];
    setMsgs(nya);
    setText("");
    fetcher.submit(
      { intent: "ask", messages: JSON.stringify(nya.map(({ role, content }) => ({ role, content }))) },
      { method: "POST", action: "/app/chat" },
    );
  };

  const knapp: React.CSSProperties = {
    position: "fixed", right: 20, bottom: 20, zIndex: 1000, width: 52, height: 52, borderRadius: 26,
    border: 0, background: "#303030", color: "#fff", fontSize: 22, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.25)",
  };
  const panel: React.CSSProperties = {
    position: "fixed", right: 20, bottom: 84, zIndex: 1000, width: "min(380px, calc(100vw - 40px))", height: "min(520px, calc(100vh - 120px))",
    background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,.25)", display: "flex", flexDirection: "column", overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 14, color: "#202223",
  };

  return (
    <>
      <button type="button" style={knapp} onClick={() => setOpen((o) => !o)} aria-label={T.chat.title} aria-expanded={open}>
        {open ? "×" : "?"}
      </button>
      {open ? (
        <div style={panel} role="dialog" aria-label={T.chat.title}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e3e3e3", fontWeight: 600 }}>{T.chat.title}</div>
          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {!msgs.length ? <div style={{ color: "#616161", whiteSpace: "pre-line" }}>{T.chat.intro}</div> : null}
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                <div style={{
                  background: m.role === "user" ? "#303030" : "#f1f1f1", color: m.role === "user" ? "#fff" : "#202223",
                  padding: "8px 12px", borderRadius: 12, whiteSpace: "pre-wrap", lineHeight: 1.4,
                }}>
                  {m.content}
                </div>
                {m.actions?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                    {m.actions.map((a, j) => <ActionKnapp key={j} a={a} T={T} />)}
                  </div>
                ) : null}
              </div>
            ))}
            {laddar ? <div style={{ color: "#616161" }}>{T.chat.thinking}</div> : null}
          </div>
          <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #e3e3e3" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); skicka(); } }}
              placeholder={T.chat.placeholder}
              aria-label={T.chat.placeholder}
              style={{ flex: 1, padding: "8px 10px", border: "1px solid #c9c9c9", borderRadius: 8, fontSize: 14 }}
            />
            <button type="button" onClick={skicka} disabled={laddar || !text.trim()}
              style={{ padding: "8px 14px", border: 0, borderRadius: 8, background: "#303030", color: "#fff", cursor: "pointer", opacity: laddar || !text.trim() ? 0.5 : 1 }}>
              {T.chat.send}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Ett förslag från assistenten. Klicket är det som skriver — aldrig svaret. */
function ActionKnapp({ a, T }: { a: Action; T: Texts }) {
  const fetcher = useFetcher<{ ok: boolean; message: string }>();
  const klar = fetcher.data?.ok === true;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        disabled={klar || fetcher.state !== "idle"}
        onClick={() => fetcher.submit({ intent: "apply", action: JSON.stringify(a) }, { method: "POST", action: "/app/chat" })}
        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #303030", background: klar ? "#e3f1df" : "#fff", cursor: klar ? "default" : "pointer", fontSize: 13 }}
      >
        {klar ? `✓ ${T.chat.done}` : fetcher.state !== "idle" ? T.chat.saving : a.label}
      </button>
      {fetcher.data && !fetcher.data.ok ? <span style={{ color: "#b42318", fontSize: 12 }}>{fetcher.data.message}</span> : null}
    </div>
  );
}
