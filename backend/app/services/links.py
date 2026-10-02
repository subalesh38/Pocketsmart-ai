import urllib.parse

PLATFORMS = {
    "home_items": ["Amazon", "Flipkart", "IKEA"],
    "catering": ["Swiggy", "Zomato"],
    "venue": ["Google", "Booking", "MakeMyTrip", "OYO"],
    "entertainment": ["BookMyShow", "Amazon"],
    "jewelry": ["Amazon", "Flipkart", "Bluestone", "Tanishq", "CaratLane", "Melorra"],
    "default": ["Amazon", "Flipkart", "Google"]
}

def generate_links(category: str, search_terms: str) -> list[dict]:
    cat = category.lower()
    if cat in ["lighting", "ceiling_fans", "furniture", "decor"]:
        platforms = PLATFORMS["home_items"]
    elif cat in ["catering", "food"]:
        platforms = PLATFORMS["catering"]
    elif cat == "venue":
        platforms = PLATFORMS["venue"]
    elif cat == "entertainment":
        platforms = PLATFORMS["entertainment"]
    elif cat == "jewelry":
        platforms = PLATFORMS["jewelry"]
    else:
        platforms = PLATFORMS["default"]

    query = urllib.parse.quote_plus(search_terms)
    links = []
    for p in platforms:
        url = ""
        if p == "Amazon":
            url = f"https://www.amazon.in/s?k={query}"
        elif p == "Flipkart":
            url = f"https://www.flipkart.com/search?q={query}"
        elif p == "IKEA":
            url = f"https://www.ikea.com/in/en/search/?q={query}"
        elif p == "Swiggy":
            url = f"https://www.swiggy.com/search?query={query}"
        elif p == "Zomato":
            url = f"https://www.zomato.com/search?q={query}"
        elif p == "Google":
            url = f"https://www.google.com/search?q={query}"
        elif p == "Booking":
            url = f"https://www.booking.com/searchresults.html?ss={query}"
        elif p == "MakeMyTrip":
            url = f"https://www.makemytrip.com/hotels/hotel-listing/?searchText={query}"
        elif p == "OYO":
            url = f"https://www.oyorooms.com/search?location={query}"
        elif p == "BookMyShow":
            url = f"https://in.bookmyshow.com/explore/home?query={query}"
        elif p == "Bluestone":
            url = f"https://www.bluestone.com/search.html?search_query={query}"
        elif p == "Tanishq":
            url = f"https://www.tanishq.co.in/search?q={query}"
        elif p == "CaratLane":
            url = f"https://www.caratlane.com/search?q={query}"
        elif p == "Melorra":
            url = f"https://www.melorra.com/search/?q={query}"
        
        if url:
            links.append({"platform": p, "url": url})
            
    return links
