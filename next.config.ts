import type { NextConfig } from 'next';
const config: NextConfig = {
  env: {
  "FIREBASE_SERVICE_ACCOUNT_JSON": "",
  "FIREBASE_ADMIN_PROJECT_ID": "",
  "FIREBASE_ADMIN_CLIENT_EMAIL": "",
  "FIREBASE_ADMIN_PRIVATE_KEY": "",
  "GROQ_API_KEY": "",
  "GROQ_API_KEY_ALT": "",
  "SARVAM_API_KEY": "",
  "SARVAM_API_KEY_ALT": "",
  "GNEWS_API_KEY": "",
  "ZOHO_SMTP_EMAIL": "",
  "ZOHO_SMTP_PASSWORD": ""
},
  async headers() { return [{source: '/:path*', headers: [
    {key:'X-Knobly-Preview-Mode',value:'isolated'},
    {key:'X-Robots-Tag',value:'noindex, nofollow'},
  ]}]; },
};
export default config;
