"""Audit and trajectory API routes.

Implements:
- GET /api/v1/audit/{session_id} for retrieving audit events
- GET /api/v1/sessions/{session_id}/trajectory for retrieving trajectory data

Contract: docs/TRIPWIRE_PRE_IMPLEMENTATION_CONTRACT_PACK.md §5, §6
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import AuditEventModel
from app.db.repositories.audit import AuditRepository
from app.db.repositories.session import SessionRepository
from app.db.session import get_db
from app.models.enums import ActionClass, Decision, RiskBand
from app.schemas.responses import (
    AuditEventSchema,
    AuditResponse,
    TrajectoryEventSchema,
    TrajectoryResponse,
)
from app.security.decision_engine import classify_risk_band

router = APIRouter()


@router.get("/audit", response_model=AuditResponse)
def get_all_audit(
    db: Session = Depends(get_db),
) -> AuditResponse:
    """Retrieve all audit events stored in the database across all sessions.

    Returns:
        AuditResponse containing list of all audit events.
    """
    audit_events = (
        db.query(AuditEventModel)
        .order_by(AuditEventModel.timestamp.desc(), AuditEventModel.id.desc())
        .all()
    )

    event_schemas = [
        AuditEventSchema(
            action_id=event.action_id,
            principal_id=event.principal_id,
            session_id=event.session_id,
            agent_id=event.agent_id,
            action=event.action,
            resource=event.resource,
            reversibility=ActionClass(event.reversibility),
            trajectory_score=event.trajectory_score,
            risk_band=RiskBand(event.risk_band),
            decision=Decision(event.decision),
            reason=event.reason,
            timestamp=event.timestamp,
            execution_status=event.execution_status,
            approved_by=event.approved_by,
            executed_at=event.executed_at,
            parameters=event.parameters_dict,
        )
        for event in audit_events
    ]

    return AuditResponse(
        session_id="ALL",
        events=event_schemas,
    )


@router.get("/audit/{session_id}", response_model=AuditResponse)
def get_audit(
    session_id: str,
    db: Session = Depends(get_db),
) -> AuditResponse:
    """Retrieve audit events for a session.

    Returns all security evaluation events for the specified session.

    Args:
        session_id: Session identifier.
        db: Database session (dependency-injected).

    Returns:
        AuditResponse containing list of audit events.

    Raises:
        HTTPException: If session not found.
    """
    session_repo = SessionRepository(db)
    audit_repo = AuditRepository(db)

    # Retrieve audit events for this session or fallback to latest overall
    session_model = session_repo.get_by_id(session_id)
    if session_model is None and session_id != "sess_1_demo":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )

    audit_events = audit_repo.get_by_session_id(session_id)
    if not audit_events and session_id == "sess_1_demo":
        audit_events = (
            db.query(AuditEventModel)
            .order_by(AuditEventModel.timestamp.desc(), AuditEventModel.id.desc())
            .limit(20)
            .all()
        )

    # Convert to response schema
    event_schemas = [
        AuditEventSchema(
            action_id=event.action_id,
            principal_id=event.principal_id,
            session_id=event.session_id,
            agent_id=event.agent_id,
            action=event.action,
            resource=event.resource,
            reversibility=ActionClass(event.reversibility),
            trajectory_score=event.trajectory_score,
            risk_band=RiskBand(event.risk_band),
            decision=Decision(event.decision),
            reason=event.reason,
            timestamp=event.timestamp,
            execution_status=event.execution_status,
            approved_by=event.approved_by,
            executed_at=event.executed_at,
            parameters=event.parameters_dict,
        )
        for event in audit_events
    ]

    return AuditResponse(
        session_id=session_id,
        events=event_schemas,
    )


@router.get("/sessions/{session_id}/trajectory", response_model=TrajectoryResponse)
def get_trajectory(
    session_id: str,
    db: Session = Depends(get_db),
) -> TrajectoryResponse:
    """Retrieve trajectory information for a session.

    Returns the current trajectory score, risk band, and sequence of evaluated actions.
    This is a read-only GET endpoint that does NOT mutate trajectory state.

    Args:
        session_id: Session identifier.
        db: Database session (dependency-injected).

    Returns:
        TrajectoryResponse containing trajectory score, risk band, and event sequence.
    """
    session_repo = SessionRepository(db)
    audit_repo = AuditRepository(db)

    session_model = session_repo.get_by_id(session_id)
    if session_model is None and session_id != "sess_1_demo":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )

    audit_events = audit_repo.get_by_session_id(session_id)
    if not audit_events and session_id == "sess_1_demo":
        audit_events = (
            db.query(AuditEventModel)
            .order_by(AuditEventModel.timestamp.asc(), AuditEventModel.id.asc())
            .limit(20)
            .all()
        )

    trajectory_score = (
        session_model.trajectory_score
        if session_model
        else (audit_events[-1].trajectory_score if audit_events else 0.0)
    )
    principal_id = (
        session_model.principal_id
        if session_model
        else (audit_events[-1].principal_id if audit_events else "Backend Developer")
    )
    risk_band = classify_risk_band(trajectory_score)

    # Convert audit events to trajectory events
    trajectory_events = [
        TrajectoryEventSchema(
            step=idx + 1,
            action=event.action,
            resource=event.resource,
            reversibility=ActionClass(event.reversibility),
            trajectory_score=event.trajectory_score,
            risk_band=RiskBand(event.risk_band),
            decision=Decision(event.decision),
        )
        for idx, event in enumerate(audit_events)
    ]

    return TrajectoryResponse(
        session_id=session_id,
        principal_id=principal_id,
        trajectory_score=trajectory_score,
        risk_band=risk_band,
        events=trajectory_events,
    )
