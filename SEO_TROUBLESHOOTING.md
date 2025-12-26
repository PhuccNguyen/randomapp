# 🆘 SEO TROUBLESHOOTING GUIDE

## Common SEO Issues & Solutions

### 1️⃣ PAGES NOT INDEXING

**Problem**: Pages not showing up in Google Search Results

**Diagnostic Steps:**
```
1. Check Google Search Console
   - Go to Coverage section
   - Look for "Excluded" pages
   - Click "Inspect URL" for specific page

2. Verify robots.txt
   - https://tingrandom.com/robots.txt
   - Check if page is in Disallow list

3. Check metadata
   - View page source
   - Look for <meta name="robots" content="...">
   - Should be "index, follow" for public pages

4. Verify sitemap
   - https://tingrandom.com/sitemap.xml
   - Page should be listed
```

**Solutions:**

**If page is in Disallow:**
```
❌ robots.txt has: Disallow: /public-page
✅ Solution: Remove from Disallow list
```

**If meta robots says noindex:**
```
❌ Page has: <meta name="robots" content="noindex">
✅ Solution: Change to "index, follow"
```

**If page is missing from sitemap:**
```
❌ Page not in sitemap.xml
✅ Solution: Add to app/api/sitemap/route.ts
```

**If URL is marked as Noindex:**
```
❌ Google has indexed as noindex
✅ Solution:
  1. Remove noindex meta tag
  2. Wait 24 hours
  3. Re-submit in Search Console
```

---

### 2️⃣ LOW ORGANIC TRAFFIC

**Problem**: Website getting little to no organic traffic

**Diagnostic Steps:**
```
1. Check indexing status in GSC
   - Should have 80%+ coverage
   - Fix any crawl errors

2. Check search queries in GSC
   - Should see 100+ impressions/month
   - If 0, website may not be indexed yet

3. Verify page rankings
   - Use "Position" filter in GSC
   - Should see pages in top 50 positions

4. Check bounce rate in GA4
   - High bounce = content quality issue
   - Low bounce = page is engaging
```

**Timeline Expectation:**
```
Week 1-2: 0-10 visits (crawling)
Week 3-4: 5-20 visits (indexing)
Month 2: 20-50 visits (ranking)
Month 3: 50-200+ visits (established)
```

**Solutions:**

**If no impressions in GSC:**
- ✅ Verify domain ownership
- ✅ Submit sitemap
- ✅ Wait 2-4 weeks for crawling

**If impressions but no clicks:**
- ✅ Improve meta description
- ✅ Add better keywords to title
- ✅ Increase click-through rate (CTR)

**If clicks but no conversions:**
- ✅ Improve page load speed
- ✅ Better UX and clear CTAs
- ✅ Match user intent better

---

### 3️⃣ POOR CORE WEB VITALS

**Problem**: Page Speed Insights showing low scores

**Check Score:**
- Visit: https://pagespeed.web.dev
- Enter: https://tingrandom.com

**If LCP (Largest Contentful Paint) > 2.5s:**
```
❌ Problem: Images loading too slow
✅ Solutions:
  1. Check image sizes in next.config.mjs
  2. Use priority={true} for above-fold images
  3. Ensure images are optimized (AVIF/WebP)
  4. Use next/image component (already done)
  5. Check server response time
```

**If FID (First Input Delay) > 100ms:**
```
❌ Problem: JavaScript execution blocking
✅ Solutions:
  1. Minimize JavaScript
  2. Defer non-critical scripts
  3. Use React.lazy for heavy components
  4. Check third-party scripts (Google Analytics, etc)
```

**If CLS (Cumulative Layout Shift) > 0.1:**
```
❌ Problem: Layout shifting during load
✅ Solutions:
  1. Set image width/height (already done)
  2. Reserve space for ads/embeds
  3. Use transform animations (not top/left)
  4. Avoid inserting elements above content
```

---

### 4️⃣ METADATA NOT SHOWING IN SOCIAL MEDIA

**Problem**: Open Graph tags not working on Facebook/Twitter

**Diagnostic:**
```
1. Check your page source
   - View page source (Ctrl+U)
   - Search for "og:title", "og:image"
   - Should be in <head> section

2. Test in social debuggers
   - Facebook: https://developers.facebook.com/tools/debug
   - Twitter: https://cards-dev.twitter.com/validator
```

**Solutions:**

**If og:image not showing:**
```
❌ og:image: "relative/path/image.png"
✅ Use absolute URL:
   og:image: "https://tingrandom.com/images/logo/tingnect-logo.png"

❌ og:image: "/images/logo/tingnect-logo.png" (relative)
✅ Always use: "https://domain.com/path/to/image.png" (absolute)
```

**If tags not appearing:**
```
✅ Solution: Wait 24 hours for cache clear
✅ Or: Click "Re-scrape" in Facebook debugger
✅ Or: Clear Twitter cache
```

**If preview looks wrong:**
```
✅ Solution:
  1. Check og:image dimensions (1200x630 recommended)
  2. Verify og:title (under 60 characters)
  3. Verify og:description (under 160 characters)
  4. Re-scrape social debugger
```

---

### 5️⃣ RICH RESULTS NOT SHOWING

**Problem**: Google not showing rich snippets (schema markup)

**Diagnostic:**
```
1. Test in Google Rich Results Tester
   - https://search.google.com/test/rich-results
   - Enter: https://tingrandom.com

2. Look for JSON-LD errors
   - Should see Organization and WebApplication
   - No critical errors (warnings are OK)
```

**Solutions:**

**If JSON-LD not found:**
```
❌ Problem: JSON-LD not in page source
✅ Solution: Verify app/layout.tsx has JSON-LD script tags
```

**If JSON-LD errors:**
```
❌ Error: "Missing required property"
✅ Solution: Check json/seo-helpers.tsx for required fields
```

**If rich results not showing in search:**
```
❌ Problem: Schema is valid but no rich snippet
✅ Solutions:
  1. Wait 2-4 weeks (Google needs time to recognize)
  2. Submit sitemap in Search Console
  3. Ensure content is high-quality
  4. Check for manual action penalties
```

---

### 6️⃣ CRAWL ERRORS

**Problem**: Google reporting crawl errors in Search Console

**Common Errors:**

**"404 - Not found"**
```
❌ URL returning 404 error
✅ Solutions:
  1. Check if page actually exists
  2. Fix 404 in app/api/robots/route.ts
  3. Redirect to correct URL in next.config.mjs
  4. Remove from sitemap if page deleted
```

**"Timeout - Server did not respond"**
```
❌ Server too slow to respond
✅ Solutions:
  1. Check server performance
  2. Optimize database queries
  3. Add caching headers in next.config.mjs
  4. Scale server if needed
```

**"Redirect error"**
```
❌ URL redirecting incorrectly
✅ Solutions:
  1. Check redirects in next.config.mjs
  2. Ensure redirects point to valid page
  3. Fix infinite redirect loops
  4. Use 301 for permanent redirects
```

---

### 7️⃣ DUPLICATE CONTENT

**Problem**: Multiple URLs with same content

**Diagnostic:**
```
1. Search in Google
   - site:tingrandom.com "exact phrase"
   - Look for duplicate URLs

2. Check in Search Console
   - Coverage > Excluded
   - Look for "Duplicate" entries
```

**Solutions:**

**If URLs are similar:**
```
❌ /page and /page/ both exist
✅ Solution: Set canonical URL in metadata
   canonical: "https://tingrandom.com/page"
```

**If content truly is duplicate:**
```
❌ /blog/post-1 and /news/post-1 same content
✅ Solutions:
  1. Remove one URL
  2. Add canonical tag to copy
  3. 301 redirect to main version
```

**If query parameters create duplicates:**
```
❌ /page?utm_source=google&utm_medium=cpc
✅ Solution: Add in GSC
   - Settings > URL parameters
   - Configure how to handle parameters
```

---

### 8️⃣ RANKING FLUCTUATIONS

**Problem**: Rankings constantly going up and down

**This is normal!** Fluctuations happen, especially in:
- First 3 months after launch
- After content updates
- After algorithm updates
- Competitive keywords

**Diagnostic:**
```
1. Track rankings over 30 days
2. Look at average position, not daily position
3. Check search query CTR in GSC
4. Monitor for negative changes
```

**Solutions:**

**If rankings dropping:**
```
✅ Check for:
  1. Content quality issues
  2. Broken links (crawl errors)
  3. Slow page load (Core Web Vitals)
  4. Duplicate content issues
  5. Manual action penalties in GSC
```

**If rankings not improving:**
```
✅ Try:
  1. Update content quality
  2. Add more internal links
  3. Build more backlinks
  4. Improve user experience
  5. Wait longer (first 3 months are critical)
```

---

### 9️⃣ COMPETITOR OUTRANKING

**Problem**: Competitor ranking higher than you

**Analysis:**
```
1. Compare page content
   - Length (longer often ranks better)
   - Comprehensiveness
   - Freshness (last update date)

2. Check backlinks
   - How many backlinks do they have?
   - Quality of backlinks

3. Compare rankings
   - How much higher are they?
   - For how long?
```

**Solutions:**

```
✅ Strategies:
  1. Create better, longer content
  2. Improve user experience
  3. Build more backlinks
  4. Update content more frequently
  5. Improve page speed
  6. Add rich content (images, videos)
  7. Get more social signals
```

---

### 🔟 MANUAL ACTION PENALTY

**Problem**: Google manual action warning in Search Console

**This is SERIOUS!** Manual penalties mean Google found violations.

**Check Status:**
```
1. Go to Search Console
2. Click "Security & Manual Actions"
3. Look for manual action warnings
4. See what violation was found
```

**Common Violations:**
- Unnatural links (paid links)
- Thin content
- Cloaking
- Keyword stuffing
- User-generated spam
- Hidden text/links

**How to Fix:**
```
1. Identify what caused it
2. Remove all violating content
3. Disavow bad backlinks if needed
4. Fix all issues
5. Request reconsideration in GSC
6. Wait for review (1-4 weeks)
```

---

## 🆘 QUICK TROUBLESHOOTING CHECKLIST

**Pages not indexing?**
- [ ] Check robots.txt (not in Disallow)
- [ ] Check meta robots tag (not noindex)
- [ ] Check sitemap (page included)
- [ ] Submit in Search Console
- [ ] Wait 2-4 weeks

**Low traffic?**
- [ ] Check indexing coverage (>80%)
- [ ] Check keyword rankings
- [ ] Improve content quality
- [ ] Build backlinks
- [ ] Improve page speed

**Poor Core Web Vitals?**
- [ ] Check image sizes
- [ ] Minimize JavaScript
- [ ] Optimize fonts
- [ ] Check server response time
- [ ] Use PageSpeed Insights tool

**Metadata issues?**
- [ ] Use absolute URLs for og:image
- [ ] Check image dimensions (1200x630)
- [ ] Verify character counts
- [ ] Re-scrape social debugger
- [ ] Wait 24 hours for cache

**Rich results not showing?**
- [ ] Validate JSON-LD in tester
- [ ] Wait 2-4 weeks
- [ ] Submit sitemap
- [ ] Ensure high-quality content

**Crawl errors?**
- [ ] Check error type (404, timeout, redirect)
- [ ] Fix server issues
- [ ] Remove from sitemap if needed
- [ ] Re-test in GSC

---

## 📞 NEED MORE HELP?

**Resources:**
- Google Search Central: https://developers.google.com/search
- Search Central Blog: https://developers.google.com/search/blog
- Google Analytics Help: https://support.google.com/analytics
- Stack Exchange SEO: https://webmasters.stackexchange.com

**Tools:**
- Search Console: https://search.google.com/search-console
- PageSpeed Insights: https://pagespeed.web.dev
- Mobile Friendly Test: https://search.google.com/test/mobile-friendly
- Rich Results Tester: https://search.google.com/test/rich-results
- Schema Validator: https://schema.org/validator

---

**Last Updated**: December 26, 2025  
**Difficulty**: ⭐⭐⭐ Intermediate  
**Time to Resolve**: 1-48 hours (depending on issue)
