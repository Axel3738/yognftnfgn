import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import { createReadableStreamFromReadable, type EntryContext } from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";
import { startaTokenVakt } from "./lib/token-keeper.server";

/* Varje tjänst håller sin egen butiks offline-nyckel vid liv. Utan det gick
   nycklarna ut för butiker ingen öppnat, och deras försäljning frös på noll i
   den gemensamma vyn. Entry-modulen laddas en gång per process. */
startaTokenVakt();

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  addDocumentResponseHeaders(request, responseHeaders);
  const callback = isbot(request.headers.get("user-agent") ?? "") ? "onAllReady" : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callback]: () => {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError: reject,
        onError: (error) => {
          responseStatusCode = 500;
          console.error(error);
        },
      },
    );
    // Deferred data (bulk-exporten) kan ta uppåt en minut — 5 s klippte strömmen
    // innan resultatet hann fram och spinnern satt kvar för evigt.
    setTimeout(abort, 120_000);
  });
}
