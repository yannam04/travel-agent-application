from services.agent import resolve_iata_codes
from services.flight_search import find_flight_offers, get_offer_by_id


def get_flight_by_id(flight_id: str) -> dict | None:
    return get_offer_by_id(flight_id)


def find_options(intent: dict) -> dict:
    codes = resolve_iata_codes(intent.get("origin"), intent.get("destination"))
    origin_iata = codes.get("origin_iata")
    destination_iata = codes.get("destination_iata")

    if not origin_iata or not destination_iata:
        return {"options": [], "over_budget": False, "no_route": True}

    travelers = intent.get("travelers") or 1
    children = intent.get("children") or 0
    infants = intent.get("infants") or 0
    passenger_count = travelers + children + infants

    # Duffel's offer price is the total for every passenger in the request,
    # but the budget the user enters is meant per traveler. Scale it up to an
    # equivalent group total so find_flight_offers's existing total-price
    # comparison enforces a per-traveler cap without needing to change there
    # (that function is shared with the free-text chat search, which always
    # searches a single traveler and should keep its current behavior).
    budget_usd = intent.get("budget_usd")
    total_budget = budget_usd * passenger_count if budget_usd is not None else None

    # Duffel's max_connections is an upper bound, so it can narrow the request
    # for "nonstop"/"one stop" but can't express "two_plus" (a minimum) at
    # all — that bucket is enforced by find_flight_offers's own stops_filter
    # check on the returned offers instead.
    stops_filter = intent.get("stops_filter")
    max_stops = {"nonstop": 0, "one": 1}.get(stops_filter)

    return find_flight_offers(
        origin_iata=origin_iata,
        destination_iata=destination_iata,
        depart_date=intent.get("depart_date"),
        return_date=intent.get("return_date"),
        travelers=travelers,
        children=children,
        infants=infants,
        cabin_class=intent.get("cabin_class"),
        max_stops=max_stops,
        stops_filter=stops_filter,
        sort_by=intent.get("sort_by"),
        budget_usd=total_budget,
    )
