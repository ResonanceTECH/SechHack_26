"""RBAC-матрица прав (AUTH_PLAN.md §5.2). Deny by default.

Используется зависимостями `require_permission(...)` в app/api/dependencies.py.
Права с суффиксом `:self` дополнительно ограничиваются проверкой владельца
ресурса (`resource.patient_id == current_user.patient_id`).
"""

from __future__ import annotations

ROLE_PATIENT = "patient"
ROLE_DOCTOR = "doctor"
ROLE_PSYCHOLOGIST = "psychologist"
ROLE_COORDINATOR = "coordinator"
ROLE_CLINIC_ADMIN = "clinic_admin"
ROLE_SUPER_ADMIN = "super_admin"

ALL_ROLES = (
    ROLE_PATIENT,
    ROLE_DOCTOR,
    ROLE_PSYCHOLOGIST,
    ROLE_COORDINATOR,
    ROLE_CLINIC_ADMIN,
    ROLE_SUPER_ADMIN,
)

# permission -> роли, которым оно разрешено (точная копия матрицы §5.2)
PERMISSIONS: dict[str, frozenset[str]] = {
    "patient:read:self": frozenset({ROLE_PATIENT, ROLE_SUPER_ADMIN}),
    "patient:read:any": frozenset(
        {ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_CLINIC_ADMIN, ROLE_SUPER_ADMIN}
    ),
    "patient:write": frozenset(
        {ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_SUPER_ADMIN}
    ),
    "screening:write": frozenset({ROLE_PATIENT}),
    "screening:read": frozenset(ALL_ROLES),
    "diary:write": frozenset({ROLE_PATIENT}),
    "diary:read": frozenset(
        {ROLE_PATIENT, ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_SUPER_ADMIN}
    ),
    "exercise:assign": frozenset({ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_SUPER_ADMIN}),
    "exercise:complete": frozenset({ROLE_PATIENT}),
    "alert:read": frozenset(ALL_ROLES),
    "alert:resolve": frozenset({ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_SUPER_ADMIN}),
    "medication:read:full": frozenset(
        {ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_CLINIC_ADMIN, ROLE_SUPER_ADMIN}
    ),
    "medication:read:brief": frozenset(
        {ROLE_PATIENT, ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_SUPER_ADMIN}
    ),
    "prescription:write": frozenset({ROLE_DOCTOR, ROLE_SUPER_ADMIN}),
    "prescription:read": frozenset({ROLE_PATIENT, ROLE_DOCTOR, ROLE_SUPER_ADMIN}),
    "appointment:write": frozenset(
        {ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_SUPER_ADMIN}
    ),
    "message:read": frozenset(
        {ROLE_PATIENT, ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_SUPER_ADMIN}
    ),
    "analytics:read": frozenset(
        {ROLE_DOCTOR, ROLE_PSYCHOLOGIST, ROLE_COORDINATOR, ROLE_CLINIC_ADMIN, ROLE_SUPER_ADMIN}
    ),
    "audit:read": frozenset({ROLE_CLINIC_ADMIN, ROLE_SUPER_ADMIN}),
    "employee:manage": frozenset({ROLE_CLINIC_ADMIN, ROLE_SUPER_ADMIN}),
    "clinic:manage": frozenset({ROLE_SUPER_ADMIN}),
    "diagnosis:read": frozenset(ALL_ROLES),
    "diagnosis:write": frozenset({ROLE_DOCTOR, ROLE_SUPER_ADMIN}),
    "assessment:read": frozenset(ALL_ROLES),
    "assessment:write": frozenset({ROLE_DOCTOR, ROLE_SUPER_ADMIN}),

}


def has_permission(role: str, permission: str) -> bool:
    """Проверить право роли. Неизвестная роль/право → False (deny by default).

    `super_admin` — суперпользователь: имеет все права из PERMISSIONS,
    даже если явно не перечислен в множестве (AUTH_PLAN.md §5.2).
    """
    if permission not in PERMISSIONS:
        return False
    if role == ROLE_SUPER_ADMIN:
        return True
    return role in PERMISSIONS[permission]
