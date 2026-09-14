import jwt
from typing import Dict, Any

from app.core.config import settings

def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a JWT issued by Supabase Auth using the JWT_SECRET_KEY.
    Raises jwt.InvalidTokenError if invalid.
    """
    try:
        # Supabase uses HS256 for their JWTs by default with the JWT_SECRET_KEY
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except jwt.InvalidTokenError as e:
        raise e
