B2B2C MASTER — CSV + INSTALLABLE WEBSITE

ROOT FILES
- index.html
- styles.css
- app.js
- ishwarshopify.csv
- manifest.json
- sw.js
- assets/favicon/ (all shared brand icon files)

CUSTOMER CLONE
1. Replace ishwarshopify.csv with that customer's Shopify export, keeping the exact filename.
2. Change the four CUSTOMER values at the top of app.js: firm_name, whatsapp_number, address, margin_percent.
3. Keep manifest.json, sw.js and assets/favicon unchanged unless you are changing shared branding.
4. Deploy on HTTPS (Cloudflare Pages is suitable).

INSTALL APP
The bottom Install button uses the browser's native install prompt when supported.
On iPhone/iPad it displays Safari > Share > Add to Home Screen instructions.
This is a Progressive Web App (PWA): it remains a website, not an App Store / Play Store native app.

OFFLINE + CATALOGUE CACHE
The first successful visit downloads and caches the website shell and ishwarshopify.csv.
To publish an updated CSV or website version:
1. Upload the new ishwarshopify.csv.
2. Open sw.js and change CACHE_VERSION, e.g. yournamepharma-v1 to yournamepharma-v2.
3. Commit/deploy both changes.
When the new service worker activates, the new cache is prepared and old cache removed. Existing open tabs see a reload notice to switch to the new version.
If the user is offline, the previously cached catalogue remains available.

IMPORTANT
The CSV and website are cached by version. Do not forget to increment CACHE_VERSION whenever you upload a new CSV. First visit requires internet. Browser storage may be cleared by the user or the operating system, so offline availability cannot be guaranteed forever.
