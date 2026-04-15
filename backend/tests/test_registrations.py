from datetime import date

from fastapi.testclient import TestClient

from conftest import auth_headers


def test_register_guest_with_capacity_control(client: TestClient) -> None:
    owner_headers = auth_headers(client, "owner2@example.com", "12345678", "Owner2")

    create_response = client.post(
        "/event/",
        headers=owner_headers,
        json={
            "title": "Evento Limitado",
            "description": "Solo un cupo",
            "date": str(date.today()),
            "capacity": 1,
            "state": "scheduled",
        },
    )
    event_id = create_response.json()["id"]

    guest_headers = auth_headers(client, "guest@example.com", "12345678", "Guest")
    register_response = client.post(f"/event/{event_id}", headers=guest_headers)
    assert register_response.status_code == 200

    another_guest_headers = auth_headers(client, "guest2@example.com", "12345678", "Guest2")
    full_response = client.post(f"/event/{event_id}", headers=another_guest_headers)
    assert full_response.status_code == 400
    assert "capacidad" in full_response.json()["detail"].lower()
