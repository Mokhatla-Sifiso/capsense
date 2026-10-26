"""Small Azure DevOps REST helpers for CI scripts (PAT auth, standard library only)."""
import base64
import json
import os
import urllib.parse
import urllib.request


def _auth_header() -> str:
    if os.environ.get("ADO_BEARER"):  # local testing with `az account get-access-token`
        return "Bearer " + os.environ["ADO_BEARER"]
    pat = os.environ.get("ADO_PAT", "")
    if not pat:
        raise SystemExit("ADO_PAT secret is not set")
    return "Basic " + base64.b64encode(f":{pat}".encode()).decode()


def ado(method: str, path: str, body: dict | None = None, team: bool = False) -> dict:
    org = os.environ["ADO_ORG"]
    project = urllib.parse.quote(os.environ["ADO_PROJECT"])
    scope = f"{project}/{urllib.parse.quote(os.environ['ADO_TEAM'])}" if team else project
    url = f"https://dev.azure.com/{org}/{scope}/_apis/{path}"
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, method=method, headers={"Authorization": _auth_header(), "Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read() or b"{}")
