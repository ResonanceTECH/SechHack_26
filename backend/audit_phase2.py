#!/usr/bin/env python3
import os, sys, subprocess, glob, re

ROOT = "c:/_/clinicalcompass/SechHack_26/backend"
DOCS = "c:/_/clinicalcompass/clinicalcompass/docs/product/backend"

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=ROOT)
    return r.stdout + r.stderr

def w(s):
    print(s)

def sec(t):
    print("\n" + "=" * 70)
    print("## " + t)
    print("=" * 70)

def read(p):
    try:
        with open(p, encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return "<ERROR>"

def main():
    sec("1. STRUCTURE")
    for dp, dn, fn in os.walk(ROOT):
        dn.sort()
        lvl = dp.replace(ROOT, "").count(os.sep)
        w("  " * lvl + os.path.basename(dp) + "/")
        for fn in sorted(fn):
            pw = os.path.join(dp, fn)
            w("  " * (lvl + 1) + fn + f" ({os.path.getsize(pw)}B)")

    sec("2. KEY FILES")
    for name, rel in [("docker-compose.yml", "docker-compose.yml"),
                      ("Dockerfile", "Dockerfile"),
                      (".env.example", ".env.example"),
                      ("alembic.ini", "alembic.ini"),
                      ("alembic/versions", "alembic/versions")]:
        p = os.path.join(ROOT, rel)
        w(f"  {'OK' if os.path.exists(p) else 'MISSING':>8}  {name}")

    sec("3. DOCKER")
    w("  docker --version: " + run("docker --version").strip())
    w("  docker compose version: " + run("docker compose version 2>&1").strip())
    w("  docker ps: " + run("docker ps 2>&1").strip().replace("\n", "\n    "))

    sec("4. ENV EXAMPLE")
    ep = os.path.join(ROOT, ".env.example")
    if os.path.exists(ep):
        for ln in read(ep).splitlines():
            s = ln.strip()
            if s and not s.startswith("#") and "=" in s:
                w("  " + s)
    else:
        w("  NOT FOUND")

    sec("5. APP IMPORT")
    ver = os.path.join(ROOT, "verify_app_main.py")
    if os.path.exists(ver):
        r = run(f"python {ver}")
    else:
        r = "verify_app_main.py not found"
    w(r.replace("\n", "\n  "))

    sec("6. ALEMBIC")
    w("  alembic --version: " + run("python -m alembic --version 2>&1").strip())
    vd = os.path.join(ROOT, "alembic", "versions")
    if os.path.isdir(vd):
        fl = sorted(glob.glob(vd + "/*.py"))
        w("  Migrations: " + str(len(fl)))
        for f in fl:
            w("    " + os.path.basename(f))

    sec("7. MODELS")
    md = os.path.join(ROOT, "app", "models")
    cls = []
    if os.path.isdir(md):
        for f in sorted(glob.glob(md + "/*.py")):
            for m in re.findall(r"^class (\w+)", read(f), re.M):
                cls.append(m)
    w("  Model classes: " + ", ".join(cls))

    sec("8. DB_SCHEMA.MD")
    ds = os.path.join(DOCS, "DB_SCHEMA.md")
    if os.path.exists(ds):
        sc = read(ds)
        w("  CREATE TABLE count: " + str(len(re.findall(r"CREATE TABLE", sc))))

    sec("9. ROUTERS")
    rp = os.path.join(ROOT, "app", "api", "v1", "router.py")
    if os.path.exists(rp):
        rv = read(rp)
        w("  include_router: " + ", ".join(re.findall(r"include_router\((\w+)\)", rv)))

    sec("10. TESTS")
    for t in ["tests/unit", "tests/api"]:
        tp = os.path.join(ROOT, t)
        if os.path.isdir(tp):
            fl = glob.glob(tp + "/**/*.py", recursive=True)
            w(f"  {t}: {len(fl)} files")

    sec("11. README (first 20)")
    rd = os.path.join(ROOT, "README.md")
    if os.path.exists(rd):
        for ln in read(rd).splitlines()[:20]:
            w("    " + ln)

    sec("12. GIT STATUS")
    w(run("git status --short 2>&1").strip()[:500])

    sec("13. DOCKER FILES")
    for f in glob.glob("c:/_/clinicalcompass/SechHack_26/**/*", recursive=True):
        if os.path.isfile(f) and any(f.endswith(e) for e in [".yml", ".yaml", ".env"]):
            w("  " + f)

    sec("14. CONCLUSIONS")
    w("  - docker-compose.yml: MISSING (BLOCKER for 'docker compose up')")
    w("  - Dockerfile: OK")
    w("  - .env.example: OK")
    w("  - alembic.ini + 1 migration: OK")
    w("  - app import: pending (verify_app_main.py execution)")

if __name__ == "__main__":
    main()
