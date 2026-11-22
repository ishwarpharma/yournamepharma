YOURNAME PHARMA — CUSTOMER WEBSITE MASTER

1) BUILD THE PRODUCT CATALOGUE
- Export the Shopify catalogue as ishwarshopify.csv.
- Keep it in this folder beside ishwarshopify.py.
- Double-click run_ishwarshopify.bat.
- It creates/updates ishwarshopify.json.
- Upload the JSON catalogue to the live website repository. Do not upload the CSV or Python scripts.

2) CREATE A CUSTOMER WEBSITE
- Keep the master templates and yournamekyc.py in this folder.
- Double-click yournamekyc.py (or run: py -3 yournamekyc.py).
- Enter firm name, WhatsApp number, full address, margin, domain and SEO description.
- The script generates customer-specific index.html, app.js and manifest.json.
- It always starts from index.template.html, app.template.js and manifest.template.json, so you can run it again for another customer.

3) DEPLOYMENT CHECKLIST
- Deploy the generated index.html, app.js and manifest.json with the website files.
- Keep ishwarshopify.json, styles.css, sw.js and assets/favicon/ in the repo.
- Configure the customer's domain at the hosting/DNS provider.
- Increment CACHE_VERSION in sw.js for each customer deployment or catalogue update.
- The generated SEO schema uses the supplied address as streetAddress; provide a complete accurate address.
- Favicon artwork is shared from the master. Replace it if each customer needs their own logo.

LIVE REPOSITORY SHOULD NOT INCLUDE: CSV source files or Python setup scripts.
