/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    SHOPIFY_API_KEY: string;
    SHOPIFY_API_SECRET: string;
    SHOPIFY_APP_URL: string;
    SCOPES: string;
    DATABASE_URL: string;
    /** Valfria: Logga in med Facebook för Meta-kopplingen. Båda eller ingen. */
    META_APP_ID?: string;
    META_APP_SECRET?: string;
    /** Valfri: config_id för "Facebook Login for Business" (Business-appar). */
    META_LOGIN_CONFIG_ID?: string;
  }
}
