"""
backend/app/services/stripe_service.py — Stripe to'lov xizmati
"""
import os
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

PRICE_IDS = {
    "pro":     os.getenv("STRIPE_PRICE_PRO",     ""),
    "premium": os.getenv("STRIPE_PRICE_PREMIUM", ""),
}


class StripeService:

    @staticmethod
    def create_checkout_session(
        user_email:  str,
        plan:        str,
        user_id:     int,
        success_url: str,
        cancel_url:  str,
    ) -> str:
        """Checkout sessiya yaratish → URL qaytaradi."""
        price_id = PRICE_IDS.get(plan)
        if not price_id:
            raise ValueError(f"Plan uchun narx topilmadi: {plan}")

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            customer_email=user_email,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": str(user_id), "plan": plan},
        )
        return session.url

    @staticmethod
    def verify_webhook(payload: bytes, sig_header: str) -> dict:
        """Stripe webhook imzosini tekshirish."""
        secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
        return stripe.Webhook.construct_event(payload, sig_header, secret)

    @staticmethod
    def cancel_subscription(sub_id: str) -> bool:
        """Obunani bekor qilish."""
        try:
            stripe.Subscription.delete(sub_id)
            return True
        except Exception as e:
            print(f"Stripe cancel xato: {e}")
            return False

    @staticmethod
    def get_subscription(sub_id: str) -> dict:
        """Obuna ma'lumotlarini olish."""
        try:
            return stripe.Subscription.retrieve(sub_id)
        except Exception as e:
            print(f"Stripe get sub xato: {e}")
            return {}