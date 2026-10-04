import datetime as dt

import requests

from config import DUFFEL_ACCESS_TOKEN

MAX_RESULTS = 5
FALLBACK_RESULTS = 3
DEFAULT_DAYS_AHEAD = 30

DUFFEL_API_BASE = "https://api.duffel.com"
DUFFEL_VERSION = "v2"


class FlightSearchError(Exception):
    pass


def _headers() -> dict:
    if not DUFFEL_ACCESS_TOKEN:
        raise FlightSearchError("DUFFEL_ACCESS_TOKEN is not set on the server.")
    return {
        "Authorization": f"Bearer {DUFFEL_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Duffel-Version": DUFFEL_VERSION,
    }


def default_depart_date() -> str:
    return (dt.date.today() + dt.timedelta(days=DEFAULT_DAYS_AHEAD)).isoformat()


def get_offer_by_id(offer_id: str) -> dict | None:
    headers = _headers()
    try:
        response = requests.get(f"{DUFFEL_API_BASE}/air/offers/{offer_id}", headers=headers, timeout=30)
    except requests.RequestException as exc:
        raise FlightSearchError(f"Duffel offer lookup failed: {exc}") from exc

    if response.status_code == 404:
        return None
    try:
        response.raise_for_status()
    except requests.RequestException as exc:
        raise FlightSearchError(f"Duffel offer lookup failed: {exc}") from exc

    return _flatten_offer(response.json().get("data", {}))


def _slice_duration_hours(segments: list) -> float:
    try:
        start = dt.datetime.fromisoformat(segments[0]["departing_at"])
        end = dt.datetime.fromisoformat(segments[-1]["arriving_at"])
        return round((end - start).total_seconds() / 3600, 1)
    except (KeyError, IndexError, ValueError, TypeError):
        return 0.0


def _flatten_offer(offer: dict) -> dict | None:
    try:
        segments = offer["slices"][0]["segments"]
        return {
            "id": offer["id"],
            "airline": segments[0]["operating_carrier"]["iata_code"],
            "origin": segments[0]["origin"]["iata_code"],
            "destination": segments[-1]["destination"]["iata_code"],
            "price_usd": float(offer["total_amount"]),
            "depart_date": segments[0]["departing_at"][:10],
            "arrival_date": segments[-1]["arriving_at"][:10],
            "stops": len(segments) - 1,
            "duration_hours": _slice_duration_hours(segments),
        }
    except (KeyError, IndexError, ValueError, TypeError):
        return None


CABIN_CLASSES = {"economy", "premium_economy", "business", "first"}


def _normalized(values: list, value: float) -> float:
    lo, hi = min(values), max(values)
    return 0.0 if hi == lo else (value - lo) / (hi - lo)


def _sort_offers(offers: list, sort_by: str | None) -> list:
    if sort_by == "duration":
        return sorted(offers, key=lambda o: o["duration_hours"])

    if sort_by in ("recommended", "best"):
        prices = [o["price_usd"] for o in offers]
        durations = [o["duration_hours"] for o in offers]

        def blended_score(o: dict) -> float:
            return 0.5 * _normalized(prices, o["price_usd"]) + 0.5 * _normalized(durations, o["duration_hours"])

        if sort_by == "best":
            # "Best" favors fewer stops first, then the same price/duration balance.
            return sorted(offers, key=lambda o: (o["stops"], blended_score(o)))
        return sorted(offers, key=blended_score)

    return sorted(offers, key=lambda o: o["price_usd"])


def find_flight_offers(
    origin_iata: str,
    destination_iata: str,
    depart_date: str | None = None,
    return_date: str | None = None,
    travelers: int | None = None,
    children: int | None = None,
    infants: int | None = None,
    cabin_class: str | None = None,
    max_stops: int | None = None,
    stops_filter: str | None = None,
    sort_by: str | None = None,
    budget_usd: float | None = None,
) -> dict:
    headers = _headers()
    depart_date = depart_date or default_depart_date()

    slices = [
        {
            "origin": origin_iata.upper(),
            "destination": destination_iata.upper(),
            "departure_date": depart_date,
        }
    ]
    if return_date:
        slices.append(
            {
                "origin": destination_iata.upper(),
                "destination": origin_iata.upper(),
                "departure_date": return_date,
            }
        )

    passengers = [{"type": "adult"} for _ in range(travelers or 1)]
    passengers += [{"type": "child"} for _ in range(children or 0)]
    passengers += [{"type": "infant_without_seat"} for _ in range(infants or 0)]

    body = {
        "data": {
            "slices": slices,
            "passengers": passengers,
        }
    }
    if max_stops is not None:
        body["data"]["max_connections"] = max_stops
    if cabin_class in CABIN_CLASSES:
        body["data"]["cabin_class"] = cabin_class

    try:
        response = requests.post(
            f"{DUFFEL_API_BASE}/air/offer_requests",
            params={"return_offers": "true"},
            headers=headers,
            json=body,
            timeout=30,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise FlightSearchError(f"Duffel flight search failed: {exc}") from exc

    raw_offers = response.json().get("data", {}).get("offers", [])
    offers = [o for o in (_flatten_offer(raw) for raw in raw_offers) if o is not None]

    if stops_filter == "nonstop":
        offers = [o for o in offers if o["stops"] == 0]
    elif stops_filter == "one":
        offers = [o for o in offers if o["stops"] == 1]
    elif stops_filter == "two_plus":
        offers = [o for o in offers if o["stops"] >= 2]

    if not offers:
        return {"options": [], "over_budget": False, "no_route": True, "depart_date": depart_date}

    offers = _sort_offers(offers, sort_by)

    if budget_usd is not None:
        within_budget = [o for o in offers if o["price_usd"] <= budget_usd]
        if within_budget:
            return {
                "options": within_budget[:MAX_RESULTS],
                "over_budget": False,
                "no_route": False,
                "depart_date": depart_date,
            }
        return {
            "options": offers[:FALLBACK_RESULTS],
            "over_budget": True,
            "no_route": False,
            "depart_date": depart_date,
        }

    return {"options": offers[:MAX_RESULTS], "over_budget": False, "no_route": False, "depart_date": depart_date}
