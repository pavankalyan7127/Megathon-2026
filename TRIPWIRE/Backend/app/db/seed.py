"""Deterministic database seeding for Tripwire demonstrations."""

from sqlalchemy.orm import Session

from app.db.models import PrincipalModel
from app.db.session import get_engine, init_db


DEMO_PRINCIPALS = [
    {
        "id": "Frontend Developer",
        "role": "Frontend Developer",
        "scope": "frontend:read,frontend:write,frontend:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "Backend Developer",
        "role": "Backend Developer",
        "scope": "backend:read,backend:write,backend:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "HR",
        "role": "HR",
        "scope": "hr:read,hr:write,hr:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "Project Manager",
        "role": "Project Manager",
        "scope": "projectmanager:read,projectmanager:write,projectmanager:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "Business Analyst",
        "role": "Business Analyst",
        "scope": "business_analyst:read,business_analyst:write,business_analyst:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "Software Architect",
        "role": "Software Architect",
        "scope": "architect:read,architect:write,architect:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "DevOps Engineer",
        "role": "DevOps Engineer",
        "scope": "devops:read,devops:write,devops:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    # Also support user IDs / mock users if passed by ID
    {
        "id": "1",
        "role": "Backend Developer",
        "scope": "backend:read,backend:write,backend:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
    {
        "id": "alex.rivera@techflow.com",
        "role": "Backend Developer",
        "scope": "backend:read,backend:write,backend:delete",
        "trajectory_score": 0.0,
        "max_destructiveness": 0.0,
        "scope_footprint": "[]",
        "action_counts": "{}",
    },
]


def seed_demo_data(db: Session) -> list[str]:
    """Seed or reset demo principals in the database.

    Args:
        db: SQLAlchemy session.

    Returns:
        List of seeded principal IDs.
    """
    seeded = []
    for data in DEMO_PRINCIPALS:
        principal = db.query(PrincipalModel).filter(PrincipalModel.id == data["id"]).first()
        if principal is None:
            principal = PrincipalModel(**data)
            db.add(principal)
        else:
            principal.scope = data["scope"]
            principal.trajectory_score = data["trajectory_score"]
            principal.max_destructiveness = data["max_destructiveness"]
            principal.scope_footprint = data["scope_footprint"]
            principal.action_counts = data["action_counts"]
        seeded.append(data["id"])

    db.commit()
    return seeded


if __name__ == "__main__":
    from app.db.session import get_session_factory

    init_db()
    session_factory = get_session_factory()
    with session_factory() as session:
        created = seed_demo_data(session)
        print(f"Successfully seeded {len(created)} demo principals: {', '.join(created)}")
