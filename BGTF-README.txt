# BGTF corrected site files

## Files to upload
- `index.html` — improved homepage title, description, canonical, Open Graph and WebSite structured data.
- `other-page.html` — devotional page metadata, canonical, structured data, internal Home links, corrected text, safer journal rendering and local-storage notice.
- `finance.html` — financial tracker security fixes, escaped user-generated text, noindex directive and pinned Chart.js/Lucide URLs.
- `script.js` — restricted backup/export/import code. It only exports/imports the three tracker collections and validates imported records.
- `robots.txt` and `sitemap.xml` — crawler guidance and sitemap for the two pages intended for search indexing.

## Important upload instructions
1. Make a complete copy of your current website before replacing anything.
2. Upload all six files to the same public website root, keeping the exact filenames.
3. Keep `script.js` beside `finance.html`; the finance page loads it after its application code. The homepage no longer loads this backup script.
4. The `sitemap.xml` intentionally excludes `finance.html`, which is marked `noindex` because it is a personal finance utility rather than a search landing page. `noindex` is not access control. If the tracker must be private, use hosting-level authentication or another access-control mechanism.
5. The sitemap and canonical tags assume `https://www.bgtf.net` is the preferred hostname. If the site redirects to a different host (for example, without `www`), change all canonical, Open Graph, robots and sitemap URLs to that preferred host.
6. Submit `https://www.bgtf.net/sitemap.xml` in Google Search Console and Bing Webmaster Tools after deployment.

## Backup compatibility
The new importer accepts the prior finance page backup shape (`investments`, `incomes`, `expenses`), the earlier script export containing the exact `finpulse_investments`, `finpulse_incomes`, and `finpulse_expenses` keys, and the new versioned format. It ignores all other keys (including unrelated journal entries). It intentionally rejects arbitrary localStorage dumps and unrecognized categories. Export a fresh backup after deploying and keep it somewhere safe.

## SEO priorities beyond these files
- Add useful, original pages answering specific questions about Ephesians 2:8–9, grace, faith, salvation, and related Bible passages; do not publish thin keyword pages.
- Add a genuine About/contact page that explains who maintains the site and its purpose.
- Review the Greek word-study statements for accuracy and cite reputable Bible-language references where appropriate.
- Add descriptive image alt text and a proper social-sharing image if you have a suitable original image.
- Optimize performance by replacing the Tailwind CDN runtime with a locally built/minified CSS file and self-hosting or integrity-pinning external assets.
- Use Google Search Console to verify indexing, Core Web Vitals, mobile usability, and search queries.
- Confirm the hosting provider serves HTTPS consistently and has suitable security headers. Those server settings cannot be fixed from HTML files alone.

## Testing performed locally
- JavaScript syntax check and HTML metadata / sitemap checks are performed by the preparation workflow.
- No live server deployment or Google indexing test is implied by these files.

SEO update: finance.html is now indexable and is the primary search landing page. The homepage title, description, heading and primary link emphasize the personal finance and investment tracker. The SEO copy uses relevant phrases naturally in visible page content and SoftwareApplication structured data.
