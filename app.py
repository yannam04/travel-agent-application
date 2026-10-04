import os
from functools import wraps

from flask import Flask, g, jsonify, redirect, request, send_from_directory
from flask_cors import CORS

from config import FLASK_PORT
from db import init_db
from services.auth import (
    AuthError,
    authenticate_user,
    decode_token,
    generate_token,
    get_user_by_id,
    register_user,
    request_password_reset,
    reset_password,
)
from services.agent import AgentError, run_travel_agent
from services.flight_search import FlightSearchError
from services.travel_options import find_options, get_flight_by_id
from services.trips import TripError, delete_trip, list_trips, save_trip

FRONTEND_CONTEXT_PATH = "/travelagent"
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

app = Flask(__name__, static_folder=None)
CORS(app)
init_db()


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required."}), 401

        token = auth_header[len("Bearer "):]
        try:
            payload = decode_token(token)
        except AuthError as exc:
            return jsonify({"error": str(exc)}), 401

        g.user_id = payload["sub"]
        return f(*args, **kwargs)

    return wrapper


@app.route("/api/search", methods=["POST"])
def search():
    body = request.get_json(silent=True) or {}
    message = (body.get("message") or "").strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    try:
        result = run_travel_agent(message)
    except AgentError as exc:
        return jsonify({"error": str(exc)}), 500

    status = result.pop("status")
    return jsonify(result), status


@app.route("/api/flights/search", methods=["POST"])
def flights_search():
    body = request.get_json(silent=True) or {}
    origin = (body.get("origin") or "").strip()
    destination = (body.get("destination") or "").strip()

    if not origin or not destination:
        return jsonify({"error": "origin and destination are required"}), 400

    intent = {
        "origin": origin,
        "destination": destination,
        "budget_usd": body.get("budget_usd"),
        "depart_date": body.get("depart_date"),
        "return_date": body.get("return_date"),
        "travelers": body.get("travelers"),
        "children": body.get("children"),
        "infants": body.get("infants"),
        "cabin_class": body.get("cabin_class"),
        "stops_filter": body.get("stops_filter"),
        "sort_by": body.get("sort_by"),
    }

    try:
        result = find_options(intent)
    except (AgentError, FlightSearchError) as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({
        "options": result["options"],
        "over_budget": result["over_budget"],
        "no_route": result["no_route"],
    })


@app.route("/api/flights/<flight_id>", methods=["GET"])
def flight_details(flight_id):
    try:
        flight = get_flight_by_id(flight_id)
    except FlightSearchError as exc:
        return jsonify({"error": str(exc)}), 500
    if flight is None:
        return jsonify({"error": "Flight not found."}), 404
    return jsonify(flight)


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    body = request.get_json(silent=True) or {}
    try:
        user = register_user(body.get("name"), body.get("email"), body.get("password"))
    except AuthError as exc:
        status = 409 if "already exists" in str(exc) else 400
        return jsonify({"error": str(exc)}), status

    token = generate_token(user)
    return jsonify({"token": token, "user": user}), 201


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    body = request.get_json(silent=True) or {}
    try:
        user = authenticate_user(body.get("email"), body.get("password"))
    except AuthError as exc:
        return jsonify({"error": str(exc)}), 401

    token = generate_token(user)
    return jsonify({"token": token, "user": user})


@app.route("/api/auth/forgot-password", methods=["POST"])
def auth_forgot_password():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip()

    response = {
        "message": "If an account exists for that email, we've generated a reset link.",
    }

    if email:
        token = request_password_reset(email)
        # No email service is configured in this project, so the reset link is
        # returned directly instead of being sent — dev/test-mode only.
        if token:
            response["reset_url"] = f"{FRONTEND_CONTEXT_PATH}/reset-password?token={token}"

    return jsonify(response)


@app.route("/api/auth/reset-password", methods=["POST"])
def auth_reset_password():
    body = request.get_json(silent=True) or {}
    try:
        reset_password(body.get("token"), body.get("password"))
    except AuthError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"status": "ok"})


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    return jsonify({"status": "ok"})


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def auth_me():
    try:
        user = get_user_by_id(g.user_id)
    except AuthError as exc:
        return jsonify({"error": str(exc)}), 404
    return jsonify(user)


@app.route("/api/trips", methods=["GET"])
@require_auth
def trips_list():
    return jsonify(list_trips(g.user_id))


@app.route("/api/trips", methods=["POST"])
@require_auth
def trips_create():
    body = request.get_json(silent=True) or {}
    try:
        trip = save_trip(g.user_id, body)
    except TripError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(trip), 201


@app.route("/api/trips/<int:trip_id>", methods=["DELETE"])
@require_auth
def trips_delete(trip_id):
    try:
        delete_trip(g.user_id, trip_id)
    except TripError as exc:
        return jsonify({"error": str(exc)}), 404
    return jsonify({"status": "ok"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/")
def root_redirect():
    return redirect(f"{FRONTEND_CONTEXT_PATH}/")


@app.route(FRONTEND_CONTEXT_PATH)
def frontend_root_redirect():
    return redirect(f"{FRONTEND_CONTEXT_PATH}/")


@app.route(f"{FRONTEND_CONTEXT_PATH}/", defaults={"path": ""})
@app.route(f"{FRONTEND_CONTEXT_PATH}/<path:path>")
def frontend(path):
    full_path = os.path.join(STATIC_DIR, path) if path else None
    if full_path and os.path.isfile(full_path):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


if __name__ == "__main__":
    app.run(port=FLASK_PORT, debug=True)
