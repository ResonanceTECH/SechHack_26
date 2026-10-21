import os
import os
import sys
os.environ.setdefault("SKIP_DB_TESTS", "1")
os.chdir("c:/_/clinicalcompass/SechHack_26/backend")
sys.path.insert(0, ".")
try:
    from app.main import app
    print("app import OK:", app.title)
except Exception as e:
    print("ERROR:", repr(e))

os.environ.setdefault("SKIP_DB_TESTS", "1")
os.chdir("c:/_/clinicalcompass/SechHack_26/backend")
sys.path.insert(0, ".")
try:
    from app.main import app
    print("app import OK:", app.title)
except Exception as e:
    print("ERROR:", repr(e))
