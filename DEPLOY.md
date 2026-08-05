# Amplify par deploy — kya set karna hai

## 🔴 Amplify ke Environment variables

```
NEXT_PUBLIC_API_URL           https://<backend ka public URL>/api
NEXT_PUBLIC_RAZORPAY_KEY_ID   rzp_test_...  (live jaane par rzp_live_...)
```

**Ye build ke waqt padhe jaate hain aur bundle me pak jaate hain.** Galat hue to
site build to ho jaayegi, par har visitor ka browser `localhost` ko call karega
aur kuch nahi chalega. Badalne par **dobara build karna padta hai** — sirf
variable badalna kaafi nahi.

## 🔴 Backend par (jahan bhi wo chal raha hai)

```
CORS_ORIGINS      me Amplify ka URL jodo — warna har call 401
PUBLIC_SITE_URL   https://boltirakhi.com   ← QR isi se banta hai
```

## Deploy se pehle jaanch

```
□ Backend public URL par chal raha hai (curl <url>/api/health)
□ NEXT_PUBLIC_API_URL usi ko point karta hai
□ CORS_ORIGINS me Amplify ka domain hai
□ Deploy ke baad site kholo, cart me kuch daalo → total aaye
```

## Abhi live jaane ka matlab kya hai

Ye deploy **dekhne ke liye** theek hai. **Order lene ke liye nahi**, jab tak:

| Kya | Kyun |
|---|---|
| Legal pages me `[BUSINESS: ...]` | customer ko placeholder dikhega; Razorpay live bhi nahi karega |
| Razorpay TEST mode | checkout par TEST ki patti dikhegi, asli paisa nahi katega |
| S3 nahi hai | Bolti record karna 503 dega — poora USP band |
| `PUBLIC_SITE_URL` localhost | QR galat chhapega |
| `npm run reindex` nahi chala | search khaali aayegi |
