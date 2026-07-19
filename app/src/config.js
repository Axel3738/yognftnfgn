import 'dotenv/config';

const num = (v, d) => (v == null || v === '' ? d : Number(v));

export const config = {
  port: num(process.env.PORT, 3000),
  vatPercent: num(process.env.VAT_PERCENT, 0),
  shopify: {
    store: process.env.SHOPIFY_STORE || '',
    token: process.env.SHOPIFY_ADMIN_TOKEN || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
    get enabled() { return Boolean(this.store && this.token); },
  },
  meta: {
    token: process.env.META_ACCESS_TOKEN || '',
    account: process.env.META_AD_ACCOUNT_ID || '',
    apiVersion: process.env.META_API_VERSION || 'v21.0',
    get enabled() { return Boolean(this.token && this.account); },
  },
  google: {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    customerId: (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, ''),
    loginCustomerId: (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/-/g, ''),
    get enabled() {
      return Boolean(this.developerToken && this.clientId && this.clientSecret && this.refreshToken && this.customerId);
    },
  },
};
