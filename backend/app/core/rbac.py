from fastapi import HTTPException, status
from app.models.enums import Role

# Permission matrix: role -> set of allowed actions
PERMISSIONS = {
    Role.FLEET_MANAGER: {
        "vehicles:read", "vehicles:write", "vehicles:delete",
        "drivers:read", "drivers:write", "drivers:delete",
        "trips:read", "trips:write", "trips:delete",
        "maintenance:read",
        "fuel:read",
        "expenses:read",
        "dashboard:read",
        "reports:read",
    },
    Role.DRIVER: {
        "trips:read",
        "trips:update_status",
        "fuel:write",
        "fuel:read",
    },
    Role.SAFETY_OFFICER: {
        "vehicles:read",
        "drivers:read",
        "maintenance:read", "maintenance:write", "maintenance:delete",
        "dashboard:read",
    },
    Role.FINANCIAL_ANALYST: {
        "vehicles:read",
        "drivers:read",
        "trips:read",
        "maintenance:read",
        "fuel:read",
        "expenses:read", "expenses:write", "expenses:delete",
        "dashboard:read",
        "reports:read",
    },
}


def can(role: Role, action: str) -> bool:
    """Check if a role has permission to perform an action."""
    return action in PERMISSIONS.get(role, set())


def require_permission(role: Role, action: str):
    """Raise 403 if role doesn't have the required permission."""
    if not can(role, action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{role.value}' is not authorized to perform '{action}'",
        )
