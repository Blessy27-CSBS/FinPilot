import os
import re
import json
import httpx
from typing import Dict, Any, Tuple, Optional
from backend.app.privacy.privacy_guard import PrivacyGuard
from backend.app.ai import tools

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.8-flash"

class AIOrchestrator:
    """
    CRITICAL AI ARCHITECTURE:
    1. Gemini NEVER computes arithmetic.
    2. PrivacyGuard sanitizes identifiers before LLM ingestion.
    3. Whitelisted tool selector delegates strictly to Pandas / Python analytics.
    4. Gemini or deterministic fallback narrates the verified calculation.
    5. ProofTrail evidence IDs are bound to numeric results.
    """

    TOOL_REGISTRY = {
        "get_monthly_summary": tools.tool_get_monthly_summary,
        "get_category_breakdown": tools.tool_get_category_breakdown,
        "get_top_spending": tools.tool_get_top_spending,
        "get_recurring_payments": tools.tool_get_recurring_payments,
        "get_subscriptions": tools.tool_get_subscriptions,
        "get_budget_status": tools.tool_get_budget_status,
        "get_goal_status": tools.tool_get_goal_status,
        "get_cash_radar": tools.tool_get_cash_radar,
        "get_commit_stack": tools.tool_get_commit_stack,
        "analyze_spending_change": tools.tool_analyze_spending_change,
        "detect_anomalies": tools.tool_detect_anomalies,
        "get_upcoming_obligations": tools.tool_get_upcoming_obligations,
        "run_goal_scenario": tools.tool_run_goal_scenario,
        "get_transaction_evidence": tools.tool_get_transaction_evidence
    }

    @classmethod
    def identify_tool_and_params(cls, user_prompt: str) -> Tuple[str, Dict[str, Any]]:
        text = user_prompt.lower()

        # 1. Goal What-if Scenarios
        if any(w in text for w in ["what happens if", "what if", "reduce", "cut", "reallocate", "save an extra"]):
            return "run_goal_scenario", {"scenario_text": user_prompt}

        # 2. WhyLens / Spending Changes
        if any(w in text for w in ["why did", "why has", "why spend", "increase", "spending changed", "rose", "jumped"]):
            # Extract category
            cat = "Food"
            for c in ["groceries", "food", "transportation", "shopping", "utilities", "entertainment"]:
                if c in text:
                    cat = c.capitalize()
                    break
            return "analyze_spending_change", {"category": cat}

        # 3. CommitStack / Income Allocation
        if any(w in text for w in ["committed", "commitstack", "free money", "how much of my income", "allocated"]):
            return "get_commit_stack", {}

        # 4. CashRadar / Tight cash flow / Balance safety
        if any(w in text for w in ["tight", "cashradar", "safety line", "fall below", "run out", "projection", "balance in 30 days"]):
            return "get_cash_radar", {}

        # 5. Subscriptions
        if any(w in text for w in ["subscription", "subscriptions", "recurring services", "netflix", "spotify"]):
            return "get_subscriptions", {}

        # 6. Recurring payments
        if any(w in text for w in ["recurring", "monthly bills", "fixed expenses"]):
            return "get_recurring_payments", {}

        # 7. Goals
        if any(w in text for w in ["goal", "goals", "laptop", "emergency fund", "target", "milestone"]):
            return "get_goal_status", {}

        # 8. Budgets
        if any(w in text for w in ["budget", "budgets", "over budget", "under budget", "limit"]):
            return "get_budget_status", {}

        # 9. Anomalies / Unusual spending / Duplicates
        if any(w in text for w in ["unusual", "anomaly", "anomalies", "duplicate", "leak", "weird"]):
            return "detect_anomalies", {}

        # 10. Obligations
        if any(w in text for w in ["obligation", "obligations", "due date", "upcoming bills", "due soon"]):
            return "get_upcoming_obligations", {}

        # 11. Top spending / largest expenses
        if any(w in text for w in ["most", "highest", "top spend", "largest", "biggest expense"]):
            return "get_top_spending", {"limit": 5}

        # 12. Specific Category query
        for c in ["food", "groceries", "transportation", "shopping", "utilities", "rent", "insurance", "healthcare"]:
            if c in text:
                return "get_category_breakdown", {"category": c.capitalize()}

        # Default: Monthly summary
        return "get_monthly_summary", {}

    @classmethod
    async def chat(cls, user_message: str, period: Optional[str] = None) -> Dict[str, Any]:
        # Step 1: PrivacyGuard sanitization
        masked_text, token_map, masked_count, masked_fields = PrivacyGuard.mask(user_message)

        # Step 2: Intent identification & Whitelisted Tool Selection
        tool_name, tool_params = cls.identify_tool_and_params(masked_text)

        # Step 3: Deterministic Python / Pandas Execution
        tool_func = cls.TOOL_REGISTRY.get(tool_name, tools.tool_get_monthly_summary)
        tool_result = tool_func(**tool_params)

        # Step 4: Narration Generation (LLM or fallback)
        evidence_id = tool_result.get("evidence_id") if isinstance(tool_result, dict) else None
        narration = cls._narrate_result(tool_name, tool_params, tool_result)

        # If Gemini API Key is configured, enhance narration with Gemini
        if GEMINI_API_KEY:
            try:
                gemini_narration = await cls._call_gemini_narration(masked_text, tool_name, tool_result)
                if gemini_narration:
                    # Unmask any tokens locally
                    narration = PrivacyGuard.unmask(gemini_narration, token_map)
            except Exception as e:
                print(f"Gemini narration fallback invoked: {e}")

        # Always include mandatory disclaimer
        if "Insights only, not financial advice" not in narration:
            narration += "\n\n*Insights only, not financial advice.*"

        return {
            "answer": narration,
            "tool_used": tool_name,
            "structured_data": tool_result,
            "evidence_id": evidence_id,
            "privacy_tokens_masked": masked_count,
            "masked_fields": masked_fields
        }

    @classmethod
    def _narrate_result(cls, tool_name: str, params: Dict[str, Any], data: Dict[str, Any]) -> str:
        """
        Deterministic, audit-proof narration adhering strictly to user guidelines.
        """
        if tool_name == "get_monthly_summary":
            return (
                f"For the period {data.get('period', 'current')}, your total income was ₹{data.get('total_income', 0):,.0f} "
                f"and total expenses were ₹{data.get('total_expenses', 0):,.0f}. "
                f"This generated a net savings of ₹{data.get('net_savings', 0):,.0f} (savings rate of {data.get('savings_rate', 0)}%). "
                f"Your Money Health Index is {data.get('money_health_score', {}).get('total_score', 0)}/100."
            )

        elif tool_name == "get_category_breakdown":
            cat = params.get("category", "Selected Category")
            total = data.get("total", 0.0)
            count = data.get("transactions_count", 0)
            return (
                f"You spent ₹{total:,.0f} on {cat} across {count} recorded transaction(s) during {data.get('period', 'the current month')}."
            )

        elif tool_name == "get_top_spending":
            items = data.get("items", [])
            if not items:
                return "No large transactions recorded for this period."
            lines = [f"• {it['merchant']}: ₹{it['amount']:,.0f} ({it['category']} on {it['date']})" for it in items[:4]]
            return f"Your largest expenses for the period:\n" + "\n".join(lines)

        elif tool_name == "get_commit_stack":
            return (
                f"Out of your recorded monthly income of ₹{data.get('monthly_income', 0):,.0f}, "
                f"₹{data.get('committed_amount', 0):,.0f} ({data.get('committed_percentage', 0)}%) is committed to recurring obligations, "
                f"₹{data.get('goal_contributions', 0):,.0f} is directed to active goals, "
                f"and ₹{data.get('typical_variable', 0):,.0f} is spent on typical variable expenses. "
                f"Your estimated truly free money is ₹{data.get('free_money', 0):,.0f} ({data.get('free_money_percentage', 0)}%)."
            )

        elif tool_name == "get_cash_radar":
            return data.get("explanation", "Cash flow projections calculated based on recorded recurring commitments.")

        elif tool_name == "analyze_spending_change":
            return data.get("explanation", "Spending shift decomposed into price and frequency effects.")

        elif tool_name == "get_subscriptions":
            subs = data.get("subscriptions", [])
            return (
                f"FinPilot identified {len(subs)} active subscriptions with a combined annualized commitment of "
                f"₹{data.get('total_annualized_cost', 0):,.0f}. "
                + " ".join([f"{s['service']} (₹{s['current_price']:,.0f}/{s['frequency']})" for s in subs[:3]])
            )

        elif tool_name == "run_goal_scenario":
            return data.get("explanation", "Scenario simulation completed.")

        elif tool_name == "detect_anomalies":
            anoms = data.get("anomalies", [])
            if not anoms:
                return "No spending anomalies detected compared with your historical baseline."
            return (
                f"Identified {len(anoms)} unusual transaction pattern(s) compared with your historical spending. "
                f"For instance, {anoms[0].get('explanation', '')}"
            )

        elif tool_name == "get_budget_status":
            perf = data.get("budget_performance", [])
            over = [p for p in perf if p.get("status") == "over_budget"]
            if over:
                return f"You have {len(over)} category/categories exceeding budget targets: {', '.join([o['category'] for o in over])}."
            return f"All {len(perf)} tracked categories are currently performing within your allocated budgets."

        elif tool_name == "get_goal_status":
            goals = data.get("goals", [])
            if not goals:
                return "No financial goals are currently configured. You can set goals in the GoalShift tab."
            return f"You have {len(goals)} active financial goal(s). Leading goal: {goals[0]['name']} (Target ₹{goals[0]['target_amount']:,.0f}, est. {goals[0]['estimated_completion_date']})."

        return "Analysis completed based on your recorded transactions."

    @classmethod
    async def _call_gemini_narration(cls, masked_prompt: str, tool_name: str, tool_data: Dict[str, Any]) -> Optional[str]:
        """
        Uses Gemini to formulate an empathetic, clear narration of the EXACT numbers
        computed by the Python tool. Gemini is instructed NEVER to modify or invent figures.
        """
        system_instruction = (
            "You are FinPilot, a personal finance decision support agent. "
            "You explain users' financial metrics based on real calculations provided to you. "
            "STRICT RULES:\n"
            "1. NEVER invent, modify, or calculate arithmetic numbers. Use the exact figures provided in the tool output.\n"
            "2. FinPilot provides INSIGHTS ONLY, NOT FINANCIAL ADVICE. Never recommend investments or stocks.\n"
            "3. Use calm, objective, supportive language. Do not shame the user.\n"
            "4. For anomalies, say 'Unusual compared with your historical spending' - NEVER say 'fraud'.\n"
            "5. For projections, use words like 'projected' or 'estimated'."
        )

        user_content = (
            f"User Question: {masked_prompt}\n\n"
            f"Tool Executed: {tool_name}\n"
            f"Verified Python Calculations (Do NOT alter these figures):\n{json.dumps(tool_data, indent=2)}\n\n"
            f"Please synthesize this into a clear, helpful 2-4 sentence explanation for the user."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_content}"}]}
            ],
            "generationConfig": {
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                result = resp.json()
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
        return None
