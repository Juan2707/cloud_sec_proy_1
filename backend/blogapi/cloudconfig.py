import os
import json
from google.cloud import secretmanager
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv()

def get_secret_payload(secret_id: str, project_id: str):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    payload = response.payload.data.decode("UTF-8")
    return json.loads(payload)

# Leer valores desde .env
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
FORCE_ROLLBACK = os.getenv("FORCE_ROLLBACK", "false").lower() == "true"

# Leer secreto desde Secret Manager
secret = get_secret_payload("db-credentials", PROJECT_ID)

# Construir DATABASE_URL para MySQL + aiomysql
DATABASE_URL = (
    f"mysql+aiomysql://{secret['username']}:{secret['password']}"
    f"@{secret['host']}:3306/{secret['database']}"
)
