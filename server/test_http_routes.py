import urllib.request

routes = [
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/dashboard',
    '/modules',
    '/exercise',
    '/assessment',
    '/progress',
    '/instructor',
    '/assessor',
    '/admin-portal',
    '/docs',
    '/settings'
]

print("==================================================================")
print("  TESTING VITE FRONTEND ROUTES FOR WHITE PAGE & HTTP 200 ERRORS   ")
print("==================================================================")

success_count = 0
for r in routes:
    url = f"http://localhost:3009{r}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            if resp.status == 200:
                print(f"[OK 200] Route {r} loaded successfully.")
                success_count += 1
            else:
                print(f"[!] Warning on route {r}: HTTP Status {resp.status}")
    except Exception as e:
        print(f"[!] Error loading route {r}: {e}")

print("==================================================================")
print(f"  ROUTE VERIFICATION COMPLETE: {success_count} / {len(routes)} Routes OK.  ")
print("==================================================================")
