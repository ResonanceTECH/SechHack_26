"""RBAC-матрица: deny by default + соответствие AUTH_PLAN.md §5.2."""

from app.core.permissions import ALL_ROLES, PERMISSIONS, has_permission


class TestRbacMatrix:
    def test_deny_by_default(self) -> None:
        assert has_permission("patient", "no:such:permission") is False
        assert has_permission("no_such_role", "patient:read:self") is False

    def test_patient_cannot_write_prescriptions(self) -> None:
        assert has_permission("patient", "prescription:write") is False

    def test_psychologist_no_prescriptions(self) -> None:
        """Психолог назначает упражнения, но НЕ рецепты (ТЗ §5–6)."""
        assert has_permission("psychologist", "exercise:assign") is True
        assert has_permission("psychologist", "prescription:write") is False

    def test_patient_scoped_rights(self) -> None:
        assert has_permission("patient", "screening:write") is True
        assert has_permission("patient", "diary:write") is True
        assert has_permission("patient", "patient:write") is False

    def test_super_admin_has_all(self) -> None:
        for permission in PERMISSIONS:
            assert has_permission("super_admin", permission), permission

    def test_clinic_admin_no_patient_write(self) -> None:
        assert has_permission("clinic_admin", "employee:manage") is True
        assert has_permission("clinic_admin", "patient:write") is False
        assert has_permission("clinic_admin", "audit:read") is True

    def test_coordinator_no_clinical_decisions(self) -> None:
        """Координатор администрирует записи, но не назначает упражнения/рецепты."""
        assert has_permission("coordinator", "appointment:write") is True
        assert has_permission("coordinator", "exercise:assign") is False
        assert has_permission("coordinator", "prescription:write") is False

    def test_all_roles_defined(self) -> None:
        for role in ALL_ROLES:
            assert isinstance(role, str)
