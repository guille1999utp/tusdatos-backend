from datetime import date

from fastapi.testclient import TestClient

from conftest import auth_headers


def test_event_crud_and_search(client: TestClient) -> None:
    headers = auth_headers(client, "owner@example.com", "12345678", "Owner")

    create_response = client.post(
        "/event/",
        headers=headers,
        json={
            "title": "Python Day",
            "description": "Evento tecnico",
            "date": str(date.today()),
            "capacity": 10,
            "state": "scheduled",
        },
    )
    assert create_response.status_code == 200
    event_id = create_response.json()["id"]

    search_response = client.get("/event/search/by-title", headers=headers, params={"query": "Python"})
    assert search_response.status_code == 200
    assert any(event["id"] == event_id for event in search_response.json())

    delete_response = client.delete(f"/event/{event_id}", headers=headers)
    assert delete_response.status_code == 200
