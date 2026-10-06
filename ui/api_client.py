"""Client for interacting with the SRE Platform FastAPI backend."""

import requests
from typing import Dict, Any, Optional


class SREAPIClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")
        self.token: Optional[str] = None
        self.user_info: Optional[Dict[str, Any]] = None

    def login(self, username: str, password: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/v1/auth/login"
        resp = requests.post(url, json={"username": username, "password": password}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        self.token = data["access_token"]
        self.user_info = data
        return data

    def get_headers(self) -> Dict[str, str]:
        if not self.token:
            return {}
        return {"Authorization": f"Bearer {self.token}"}

    def investigate(self, question: str, service_name: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        url = f"{self.base_url}/api/v1/investigate"
        payload = {
            "question": question,
            "service_name": service_name,
            "force_refresh": force_refresh,
        }
        resp = requests.post(url, json=payload, headers=self.get_headers(), timeout=30)
        resp.raise_for_status()
        return resp.json()

    def get_audit_events(self, limit: int = 15) -> list:
        url = f"{self.base_url}/api/v1/audit/events?limit={limit}"
        resp = requests.get(url, headers=self.get_headers(), timeout=10)
        resp.raise_for_status()
        return resp.json()
