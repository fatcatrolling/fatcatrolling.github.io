# DNS Setup — Pointing `fatcatrolling.com` (Porkbun) at GitHub Pages

This is a one-time setup. It usually takes 5–30 minutes for the DNS to propagate.

Do this AFTER you've pushed the site to GitHub and enabled Pages (see [`README.md`](README.md)).

---

## Step 1 — Log into Porkbun

Go to <https://porkbun.com/> and log in. Click **Domain Management** in the top nav. Find `fatcatrolling.com` and click **Details**.

## Step 2 — Open the DNS records page

In the domain details, find the **DNS** tab (sometimes called "DNS Records" or labeled with a globe icon).

## Step 3 — Delete the default parking records

Porkbun usually pre-fills a parking page record. Delete any existing `A` and `CNAME` records that point at Porkbun's parking servers. (Keep the `NS` records — those identify the nameservers.)

## Step 4 — Add the GitHub Pages records

Add **four `A` records** (for the apex `fatcatrolling.com`) and **one `CNAME` record** (for `www.fatcatrolling.com`):

### A records (apex domain → GitHub's IPs)

| Type | Host | Answer | TTL |
| --- | --- | --- | --- |
| A | (blank — or `@`) | `185.199.108.153` | 600 |
| A | (blank — or `@`) | `185.199.109.153` | 600 |
| A | (blank — or `@`) | `185.199.110.153` | 600 |
| A | (blank — or `@`) | `185.199.111.153` | 600 |

These four IPs are GitHub Pages' apex servers. They are public and shared by all GitHub Pages users.

### CNAME record (www → your GitHub Pages site)

| Type | Host | Answer | TTL |
| --- | --- | --- | --- |
| CNAME | `www` | `YOUR-USERNAME.github.io.` | 600 |

Replace `YOUR-USERNAME` with your actual GitHub username. Note the **trailing dot** after `.io.` — Porkbun's interface usually adds this automatically.

## Step 5 — Save changes

Click **Save** or **Add** for each record. Porkbun will confirm the changes.

## Step 6 — Verify on GitHub

1. Go to your repo on GitHub
2. **Settings → Pages**
3. Under **Custom domain**, enter `fatcatrolling.com` and click Save
4. GitHub will run a DNS check. If you see a green ✓ "DNS check successful", you're set
5. Once the check passes, tick **Enforce HTTPS** (it may take 10–30 minutes for HTTPS to become available — that's GitHub provisioning the SSL certificate via Let's Encrypt)

## Step 7 — Wait, then test

DNS changes can take anywhere from 1 minute to 24 hours to propagate worldwide (typically 5–30 min).

To check progress:

- Visit <https://dnschecker.org/#A/fatcatrolling.com> — you should see the four GitHub IPs appearing globally
- Once they all show, visit <https://fatcatrolling.com> in your browser

---

## Common pitfalls

**"DNS check unsuccessful" on GitHub even though Porkbun looks right.**
Wait 10 minutes and click "Save" again. GitHub caches DNS lookups; a re-save forces it to recheck.

**My site loads but the browser shows a security warning.**
HTTPS certificate is still provisioning. Wait 30 minutes and try again. Make sure "Enforce HTTPS" is checked once available.

**`www.fatcatrolling.com` works but `fatcatrolling.com` doesn't (or vice-versa).**
Either A records (apex) or CNAME (www) are misconfigured. Re-check Step 4 carefully.

**I changed the GitHub username — what now?**
1. Update the CNAME record in Porkbun to point at the new username
2. Update the `CNAME` file in your repo (just the file in the repo root, not a DNS record)
3. Push the change

---

## Reference

- [GitHub Pages: Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Porkbun knowledge base](https://kb.porkbun.com/)
