import json
from app.services.links import generate_links
from app.services.fallbacks import get_fallback, FALLBACK_HOME, FALLBACK_PARTY, FALLBACK_JEWELRY

def test_generate_links_all_categories():
    # home items
    home_links = generate_links("lighting", "desk lamp")
    platforms = [l["platform"] for l in home_links]
    assert "Amazon" in platforms
    assert "Flipkart" in platforms
    assert "IKEA" in platforms
    assert all("url" in l for l in home_links)

    # catering
    cat_links = generate_links("catering", "buffet")
    assert any(l["platform"] == "Swiggy" for l in cat_links)
    assert any(l["platform"] == "Zomato" for l in cat_links)

    # venue
    venue_links = generate_links("venue", "banquet hall")
    assert any(l["platform"] == "Booking" for l in venue_links)
    assert any(l["platform"] == "MakeMyTrip" for l in venue_links)
    assert any(l["platform"] == "OYO" for l in venue_links)

    # entertainment
    ent_links = generate_links("entertainment", "DJ")
    assert any(l["platform"] == "BookMyShow" for l in ent_links)

    # jewelry
    jewel_links = generate_links("jewelry", "gold ring")
    assert any(l["platform"] == "Bluestone" for l in jewel_links)
    assert any(l["platform"] == "Tanishq" for l in jewel_links)
    assert any(l["platform"] == "CaratLane" for l in jewel_links)
    assert any(l["platform"] == "Melorra" for l in jewel_links)

    # default
    def_links = generate_links("unknown_category", "something")
    assert any(l["platform"] == "Google" for l in def_links)

def test_fallbacks():
    home = json.loads(get_fallback("home"))
    assert "items" in home and len(home["items"]) > 0

    party = json.loads(get_fallback("party"))
    assert "checklist" in party

    jewelry = json.loads(get_fallback("jewelry"))
    assert "outfit_analysis" in jewelry

    unknown = json.loads(get_fallback("unknown"))
    assert unknown == {"items": []}
