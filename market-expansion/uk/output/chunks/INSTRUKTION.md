# Push-instruktion per chunk (BeaverShop UK)

För varje rad i din chunk-fil (JSONL, en produkt per rad, formen `{"input": {...}}`):

1. Ladda Shopify-MCP-verktyget via ToolSearch: `select:mcp__Shopify__graphql_mutation`.
2. Kör mutationen nedan med radens `input`-objekt som variabeln `input`
   (skicka variables som JSON: `{"input": <radens input>}`):

```graphql
mutation PS($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product { id handle }
    userErrors { field message }
  }
}
```

3. Logga resultatet som EN rad JSON i loggfilen
   `market-expansion/uk/output/push-results/<chunknamn>.log.jsonl`:
   - lyckad: `{"handle":"...","id":"gid://shopify/Product/...","status":"ok"}`
   - fel: `{"handle":"...","status":"error","errors":[...]}` (userErrors eller feltext)

Regler:
- Kör raderna SEKVENTIELLT, en i taget (rate limits).
- Vid throttling/nätverksfel: vänta ~5 s och försök samma rad igen (max 3 försök).
- Vid userErrors: logga och gå vidare — försök INTE ändra produktdatan själv.
- Ändra ALDRIG innehållet i input (inga "förbättringar" av texter/priser).
- Skriv loggfilen inkrementellt (appenda efter varje produkt), inte bara på slutet.
