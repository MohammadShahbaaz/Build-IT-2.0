import requests
from bs4 import BeautifulSoup
import time
import re
import random
from supabase import create_client

# Your Supabase credentials
SUPABASE_URL = "https://icxtjgimosxyxomztfil.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeHRqZ2ltb3N4eXhvbXp0ZmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzM0MTksImV4cCI6MjA5NjMwOTQxOX0.FJFTAn71RWg9qmdEs2gykAoljaX3YqzHpfM0fu41mQ8"
AMAZON_TAG = "buildit0b-21"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS_LIST = [
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    },
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    },
]

def search_amazon(query):
    """Search Amazon.in for a product and return the first ASIN"""
    search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
    headers = random.choice(HEADERS_LIST)
    try:
        time.sleep(random.uniform(3, 9))
        res = requests.get(search_url, headers=headers, timeout=15)

        if res.status_code != 200:
            print(f"  Blocked (status {res.status_code}), waiting 5s...")
            time.sleep(5)
            return None

        soup = BeautifulSoup(res.text, "html.parser")

        # Try finding ASIN from data-asin attributes
        results = soup.select('[data-asin]')
        for r in results:
            asin = r.get('data-asin')
            if asin and len(asin) == 10:
                return asin

        # Fallback: find ASIN in page links
        links = soup.find_all('a', href=re.compile(r'/dp/[A-Z0-9]{10}'))
        for link in links:
            match = re.search(r'/dp/([A-Z0-9]{10})', link['href'])
            if match:
                return match.group(1)

    except Exception as e:
        print(f"  Error searching for {query}: {e}")
    return None

def make_affiliate_url(asin):
    return f"https://www.amazon.in/dp/{asin}?tag={AMAZON_TAG}"

def update_table(table, items):
    """Search Amazon for each item and update its amazon_url in Supabase"""
    print(f"\n--- Updating {table} ---")
    for item in items:
        name = item['name']
        print(f"Searching: {name}")

        asin = search_amazon(name)
        if asin:
            url = make_affiliate_url(asin)
            supabase.table(table).update({"amazon_url": url}).eq("name", name).execute()
            print(f"  Found ASIN: {asin} -> {url}")
        else:
            print(f"  No ASIN found for: {name}")

        time.sleep(random.uniform(4, 8))

# Only fetch components that are missing amazon_url
print("Fetching components without affiliate links...")
cpus = supabase.table("cpus").select("name").is_("amazon_url", "null").execute().data
motherboards = supabase.table("motherboards").select("name").is_("amazon_url", "null").execute().data
rams = supabase.table("rams").select("name").is_("amazon_url", "null").execute().data
gpus = supabase.table("gpus").select("name").is_("amazon_url", "null").execute().data
psus = supabase.table("psus").select("name").is_("amazon_url", "null").execute().data

# Update all tables
update_table("cpus", cpus)
update_table("motherboards", motherboards)
update_table("rams", rams)
update_table("gpus", gpus)
update_table("psus", psus)

print("\nDone! All Amazon links updated.")