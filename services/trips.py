import sqlite3
from datetime import datetime, timezone

from db import get_db

REQUIRED_FIELDS = ("airline", "origin", "destination", "price_usd", "depart_date")


class TripError(Exception):
    pass


def _row_to_trip(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "flight_id": row["flight_id"],
        "airline": row["airline"],
        "origin": row["origin"],
        "destination": row["destination"],
        "price_usd": row["price_usd"],
        "depart_date": row["depart_date"],
        "arrival_date": row["arrival_date"],
        "stops": row["stops"],
        "duration_hours": row["duration_hours"],
        "saved_at": row["created_at"],
    }


def save_trip(user_id: int, flight: dict) -> dict:
    missing = [field for field in REQUIRED_FIELDS if flight.get(field) in (None, "")]
    if missing:
        raise TripError(f"Missing required flight fields: {', '.join(missing)}")

    created_at = datetime.now(timezone.utc).isoformat()
    conn = get_db()
    try:
        cursor = conn.execute(
            """
            INSERT INTO trips (
                user_id, flight_id, airline, origin, destination,
                price_usd, depart_date, arrival_date, stops, duration_hours, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                flight.get("id"),
                flight["airline"],
                flight["origin"],
                flight["destination"],
                flight["price_usd"],
                flight["depart_date"],
                flight.get("arrival_date"),
                flight.get("stops"),
                flight.get("duration_hours"),
                created_at,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM trips WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _row_to_trip(row)
    finally:
        conn.close()


def list_trips(user_id: int) -> list[dict]:
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
        return [_row_to_trip(row) for row in rows]
    finally:
        conn.close()


def delete_trip(user_id: int, trip_id: int) -> None:
    conn = get_db()
    try:
        cursor = conn.execute(
            "DELETE FROM trips WHERE id = ? AND user_id = ?", (trip_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise TripError("Trip not found.")
    finally:
        conn.close()
