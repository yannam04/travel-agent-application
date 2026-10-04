import json
from typing import Annotated, List, Optional, TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from pydantic import BaseModel, Field

from config import ANTHROPIC_API_KEY
from services.flight_search import FlightSearchError, find_flight_offers

MODEL = "claude-opus-5"

INTENT_SYSTEM_PROMPT = (
    "You extract structured travel search intent from a user's free-form request, for use "
    "with a real flight search API that requires 3-letter IATA airport codes. Identify the "
    "origin and destination both as human-readable place names (origin, destination) and as "
    "IATA airport codes (origin_iata, destination_iata) for the primary international airport "
    "serving that place, e.g. 'Chicago' -> 'ORD', 'India' -> 'DEL' (Delhi, the country's main "
    "international gateway). Also identify budget in US dollars, optional travel dates, and "
    "number of travelers. If origin, destination, or either IATA code cannot be confidently "
    "determined, set the relevant field(s) to null (never a placeholder string) and list "
    "'origin' and/or 'destination' in missing_fields. Default travelers to 1 if not mentioned."
)

SEARCH_SYSTEM_PROMPT = (
    "You are a flight search assistant. Given a travel intent, call the search_flights tool "
    "exactly once with origin_iata, destination_iata, and any known filters (depart_date, "
    "return_date, travelers, budget_usd, max_stops, sort_by) to find matching live flights. "
    "After receiving the tool result, reply with a brief one-sentence summary of what you found."
)


class IataCodes(BaseModel):
    origin_iata: Optional[str] = Field(default=None, description="3-letter IATA code of the origin's primary airport.")
    destination_iata: Optional[str] = Field(
        default=None, description="3-letter IATA code of the destination's primary airport."
    )


class TravelIntent(BaseModel):
    origin: Optional[str] = Field(default=None, description="Departure city or country, as stated by the user.")
    destination: Optional[str] = Field(default=None, description="Arrival city or country, as stated by the user.")
    origin_iata: Optional[str] = Field(default=None, description="3-letter IATA code of the origin's primary airport.")
    destination_iata: Optional[str] = Field(
        default=None, description="3-letter IATA code of the destination's primary airport."
    )
    budget_usd: Optional[float] = Field(default=None, description="Maximum budget in US dollars.")
    depart_date: Optional[str] = Field(default=None, description="Departure date, ISO 8601 if known.")
    return_date: Optional[str] = Field(default=None, description="Return date, ISO 8601 if known.")
    travelers: int = Field(default=1, description="Number of travelers.")
    missing_fields: List[str] = Field(
        default_factory=list, description="Names of fields that could not be determined."
    )


class AgentState(TypedDict):
    message: str
    intent: dict
    messages: Annotated[list, add_messages]
    final: dict


class AgentError(Exception):
    pass


def _require_api_key():
    if not ANTHROPIC_API_KEY:
        raise AgentError("ANTHROPIC_API_KEY is not set on the server.")


def _chat_model():
    return ChatAnthropic(model=MODEL, api_key=ANTHROPIC_API_KEY, max_tokens=1024)


def resolve_iata_codes(origin: str, destination: str) -> dict:
    """Resolve human-readable place names to 3-letter IATA airport codes."""
    _require_api_key()
    structured_model = _chat_model().with_structured_output(IataCodes)
    codes = structured_model.invoke(
        [
            SystemMessage(
                content=(
                    "Resolve each place name to the 3-letter IATA code of its primary "
                    "international airport, e.g. 'Chicago' -> 'ORD', 'India' -> 'DEL' (Delhi, "
                    "the country's main international gateway). If a place cannot be confidently "
                    "resolved, set its field to null (never a placeholder string)."
                )
            ),
            HumanMessage(content=f"Origin: {origin}\nDestination: {destination}"),
        ]
    )
    return codes.model_dump()


@tool
def search_flights(
    origin_iata: str,
    destination_iata: str,
    depart_date: Optional[str] = None,
    return_date: Optional[str] = None,
    travelers: Optional[int] = None,
    max_stops: Optional[int] = None,
    sort_by: Optional[str] = None,
    budget_usd: Optional[float] = None,
) -> str:
    """Search live flight offers via the Duffel API between two airports (3-letter IATA codes).

    depart_date defaults to a date 30 days out if not given. budget_usd filters to fares at or
    under that amount (falls back to the 3 cheapest overall if nothing qualifies, with
    over_budget=True). max_stops caps the number of stops. sort_by is 'price' (default) or
    'duration'. Returns a JSON object with options, over_budget, no_route, and the depart_date
    actually used.
    """
    try:
        result = find_flight_offers(
            origin_iata=origin_iata,
            destination_iata=destination_iata,
            depart_date=depart_date,
            return_date=return_date,
            travelers=travelers,
            max_stops=max_stops,
            sort_by=sort_by,
            budget_usd=budget_usd,
        )
    except FlightSearchError as exc:
        return json.dumps({"error": str(exc)})
    return json.dumps(result)


def _extract_intent_node(state: AgentState) -> dict:
    structured_model = _chat_model().with_structured_output(TravelIntent)
    intent = structured_model.invoke(
        [SystemMessage(content=INTENT_SYSTEM_PROMPT), HumanMessage(content=state["message"])]
    ).model_dump()

    missing = set(intent.get("missing_fields") or [])
    if not intent.get("origin") or not intent.get("origin_iata"):
        missing.add("origin")
    if not intent.get("destination") or not intent.get("destination_iata"):
        missing.add("destination")
    intent["missing_fields"] = sorted(missing)

    return {"intent": intent}


def _route_after_intent(state: AgentState) -> str:
    missing = set(state["intent"].get("missing_fields") or [])
    if missing & {"origin", "destination"}:
        return "missing"
    return "search"


def _missing_fields_node(state: AgentState) -> dict:
    intent = state["intent"]
    return {
        "final": {
            "intent": intent,
            "missing_fields": intent.get("missing_fields", []),
            "options": [],
            "status": 422,
        }
    }


def _prepare_search_node(state: AgentState) -> dict:
    intent = state["intent"]
    intent_text = json.dumps(
        {
            "origin_iata": intent.get("origin_iata"),
            "destination_iata": intent.get("destination_iata"),
            "budget_usd": intent.get("budget_usd"),
            "depart_date": intent.get("depart_date"),
            "return_date": intent.get("return_date"),
            "travelers": intent.get("travelers"),
        }
    )
    return {
        "messages": [
            SystemMessage(content=SEARCH_SYSTEM_PROMPT),
            HumanMessage(content=f"Travel intent: {intent_text}"),
        ]
    }


def _call_model_node(state: AgentState) -> dict:
    model = _chat_model().bind_tools([search_flights])
    ai_message = model.invoke(state["messages"])
    return {"messages": [ai_message]}


def _route_after_model(state: AgentState) -> str:
    last = state["messages"][-1]
    if getattr(last, "tool_calls", None):
        return "tools"
    return "finalize"


def _finalize_node(state: AgentState) -> dict:
    for msg in reversed(state["messages"]):
        if isinstance(msg, ToolMessage) and msg.name == "search_flights":
            tool_result = json.loads(msg.content)
            if "error" in tool_result:
                raise AgentError(tool_result["error"])

            intent = dict(state["intent"])
            intent["depart_date"] = tool_result.get("depart_date", intent.get("depart_date"))

            return {
                "final": {
                    "intent": intent,
                    "options": tool_result["options"],
                    "over_budget": tool_result["over_budget"],
                    "no_route": tool_result["no_route"],
                    "status": 200,
                }
            }
    raise AgentError("The agent did not perform a flight search.")


def _build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("extract_intent", _extract_intent_node)
    graph.add_node("missing_fields", _missing_fields_node)
    graph.add_node("prepare_search", _prepare_search_node)
    graph.add_node("call_model", _call_model_node)
    graph.add_node("tools", ToolNode([search_flights]))
    graph.add_node("finalize", _finalize_node)

    graph.set_entry_point("extract_intent")
    graph.add_conditional_edges(
        "extract_intent", _route_after_intent, {"missing": "missing_fields", "search": "prepare_search"}
    )
    graph.add_edge("missing_fields", END)
    graph.add_edge("prepare_search", "call_model")
    graph.add_conditional_edges("call_model", _route_after_model, {"tools": "tools", "finalize": "finalize"})
    graph.add_edge("tools", "call_model")
    graph.add_edge("finalize", END)

    return graph.compile()


_GRAPH = None


def _get_graph():
    global _GRAPH
    if _GRAPH is None:
        _GRAPH = _build_graph()
    return _GRAPH


def run_travel_agent(message: str) -> dict:
    _require_api_key()
    try:
        result = _get_graph().invoke({"message": message, "messages": []})
    except AgentError:
        raise
    except Exception as exc:
        raise AgentError("The travel agent failed to process the request.") from exc
    return result["final"]
