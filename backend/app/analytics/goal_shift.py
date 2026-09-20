import re
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

class GoalShiftEngine:
    """
    GoalShift handles goal progress timelines and deterministic What-If scenario simulations.
    Calculations:
    - Remaining = Target - Saved
    - Months = ceil(Remaining / Monthly Contribution)
    - What-If: New Monthly = Monthly Contribution + Boost
    - Recalculates exact months and milestone dates.
    All math is performed strictly in Python.
    """

    @classmethod
    def calculate_goal_timeline(cls, target_amount: float, current_saved: float, monthly_contribution: float) -> Dict[str, Any]:
        remaining = max(0.0, target_amount - current_saved)
        if monthly_contribution <= 0:
            return {
                "remaining_amount": round(remaining, 2),
                "estimated_months": 999.0,
                "estimated_completion_date": "Indefinite (zero contribution)"
            }

        months = math.ceil(remaining / monthly_contribution)
        now = datetime.now()
        est_date = (now + timedelta(days=months * 30.5)).strftime("%B %Y")

        return {
            "remaining_amount": round(remaining, 2),
            "estimated_months": float(months),
            "estimated_completion_date": est_date
        }

    @classmethod
    def parse_scenario_text(cls, scenario_text: str) -> Tuple[Optional[str], float]:
        """
        Extracts reduction category and amount from text like:
        'Reduce shopping by ₹1,000' or 'Cut dining out by 1500'
        """
        # Look for number
        amt_match = re.search(r'(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)', scenario_text)
        amount = 1000.0
        if amt_match:
            try:
                amount = float(amt_match.group(1).replace(",", ""))
            except ValueError:
                amount = 1000.0

        # Look for category
        text_lower = scenario_text.lower()
        category = "Discretionary Spending"
        for cat in ["shopping", "food", "dining", "entertainment", "travel", "groceries", "subscription"]:
            if cat in text_lower:
                category = cat.capitalize()
                break

        return category, amount

    @classmethod
    def simulate_scenario(
        cls,
        goal: Dict[str, Any],
        scenario_text: str,
        custom_boost: Optional[float] = None
    ) -> Dict[str, Any]:
        
        target = float(goal["target_amount"])
        saved = float(goal["current_saved_amount"])
        original_monthly = float(goal["monthly_contribution"])

        category, detected_amt = cls.parse_scenario_text(scenario_text)
        additional_savings = custom_boost if custom_boost is not None else detected_amt

        # Current timeline
        curr_tl = cls.calculate_goal_timeline(target, saved, original_monthly)
        before_months = curr_tl["estimated_months"]
        before_date = curr_tl["estimated_completion_date"]

        # New timeline with scenario boost
        scenario_monthly = original_monthly + additional_savings
        new_tl = cls.calculate_goal_timeline(target, saved, scenario_monthly)
        after_months = new_tl["estimated_months"]
        after_date = new_tl["estimated_completion_date"]

        months_saved = max(0.0, before_months - after_months)

        explanation = (
            f"If you reallocate ₹{additional_savings:,.0f}/month from {category} toward {goal['name']}, "
            f"your monthly contribution increases from ₹{original_monthly:,.0f} to ₹{scenario_monthly:,.0f}. "
            f"This would achieve your goal in {int(after_months)} months ({after_date}) "
            f"instead of {int(before_months)} months ({before_date}), reaching it {int(months_saved)} months sooner."
        )

        return {
            "goal_id": str(goal.get("id", "")),
            "goal_name": goal.get("name", "Goal"),
            "target_amount": target,
            "current_saved_amount": saved,
            "original_contribution": original_monthly,
            "scenario_contribution": scenario_monthly,
            "additional_monthly_savings": additional_savings,
            "before_months": before_months,
            "after_months": after_months,
            "months_saved": months_saved,
            "before_date": before_date,
            "after_date": after_date,
            "explanation": explanation
        }
