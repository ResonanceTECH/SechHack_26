import sys, os, uuid
sys.path.insert(0, os.path.dirname(__file__))
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.clinic import Clinic
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.auth import InviteCode
from datetime import datetime, timedelta

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL is not set. Copy .env.example → .env and fill values.")
    sys.exit(1)
# seed uses sync engine; normalize driver
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

session = SessionLocal()

# Check if data already exists
existing = session.query(User).filter(User.email == "doctor@clinicalcompass.com").first()
if existing:
    print("Seed data already exists, skipping.")
    session.close()
    sys.exit(0)

# 1. Create Clinic
clinic = Clinic(name="Clinical Compass Clinic", address="123 Health Street, Medical District", inn="7707077766")
session.add(clinic)
session.commit()
print(f"Created clinic: {clinic.name} (id={clinic.id})")

# 2. Create Doctor user
doctor_user = User(email="doctor@clinicalcompass.com", phone="+79991234567", phone_verified=True, password_hash="hashed_password", role="doctor")
session.add(doctor_user)
session.commit()
print(f"Created doctor user: {doctor_user.email} (id={doctor_user.id})")

# 3. Create PractitionerProfile for doctor
doctor_profile = PractitionerProfile(user_id=doctor_user.id, first_name="Ivan", last_name="Petrov", middle_name="Ivanovich", specialization="psychotherapist", license_number="LIC-12345", clinic_id=clinic.id)
session.add(doctor_profile)
session.commit()
print(f"Created practitioner profile: {doctor_profile.specialization} (id={doctor_profile.id})")

# 4. Create Psychologist user
psych_user = User(email="psychologist@clinicalcompass.com", phone="+79999876543", phone_verified=True, password_hash="hashed_password", role="psychologist")
session.add(psych_user)
session.commit()
print(f"Created psychologist user: {psych_user.email} (id={psych_user.id})")

# 5. Create PractitionerProfile for psychologist
psych_profile = PractitionerProfile(user_id=psych_user.id, first_name="Maria", last_name="Ivanova", middle_name="Sergeevna", specialization="psychologist", license_number="LIC-67890", clinic_id=clinic.id)
session.add(psych_profile)
session.commit()
print(f"Created practitioner profile: {psych_profile.specialization} (id={psych_profile.id})")

# 6. Create Coordinator user
coord_user = User(email="coordinator@clinicalcompass.com", phone="+79995554444", phone_verified=True, password_hash="hashed_password", role="coordinator")
session.add(coord_user)
session.commit()
print(f"Created coordinator user: {coord_user.email} (id={coord_user.id})")

# 7. Create PractitionerProfile for coordinator
coord_profile = PractitionerProfile(user_id=coord_user.id, first_name="Anna", last_name="Sidorova", middle_name="Petrovna", specialization="registrar", license_number="LIC-11111", clinic_id=clinic.id)
session.add(coord_profile)
session.commit()
print(f"Created practitioner profile: {coord_profile.specialization} (id={coord_profile.id})")

# 8. Create Patient user
patient_user = User(email="patient@clinicalcompass.com", phone="+79991234567", phone_verified=True, password_hash="hashed_password", role="patient")
session.add(patient_user)
session.commit()
print(f"Created patient user: {patient_user.email} (id={patient_user.id})")

# 9. Create PatientProfile
patient_profile = PatientProfile(user_id=patient_user.id, first_name="Alexey", last_name="Testov", middle_name="Sergeevich", birth_date="1990-05-15", gender="male", phone="+79991234567", consent_personal_data=True, consent_medical_data=True, clinic_id=clinic.id)
session.add(patient_profile)
session.commit()
print(f"Created patient profile: {patient_profile.last_name} {patient_profile.first_name} (id={patient_profile.id})")

# 10. Create Invite Code
invite_code = InviteCode(code="RAV27400", practitioner_id=doctor_profile.id, clinic_id=clinic.id, expires_at=datetime.utcnow() + timedelta(days=30), is_multi_use=True, max_uses=1000)
session.add(invite_code)
session.commit()
print(f"Created invite code: {invite_code.code} (id={invite_code.id})")

print("\nSeed data created successfully!")
print("Summary:")
print(f"  Clinic: {clinic.name} (id={clinic.id})")
print(f"  Doctor: {doctor_user.email} ({doctor_profile.specialization}) (id={doctor_profile.id})")
print(f"  Psychologist: {psych_user.email} ({psych_profile.specialization}) (id={psych_profile.id})")
print(f"  Coordinator: {coord_user.email} ({coord_profile.specialization}) (id={coord_profile.id})")
print(f"  Patient: {patient_user.email} (id={patient_profile.id})")
print(f"  Invite Code: {invite_code.code} (practitioner: {invite_code.practitioner_id})")

session.close()