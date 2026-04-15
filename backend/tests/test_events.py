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


def test_event_list_advanced_filters(client: TestClient) -> None:
    headers = auth_headers(client, "owner-filters@example.com", "12345678", "Owner Filters")

    event_payloads = [
        {
            "title": "Backend Summit",
            "description": "Filtro por estado",
            "date": str(date.today()),
            "capacity": 50,
            "state": "scheduled",
        },
        {
            "title": "Frontend Night",
            "description": "Filtro por capacidad",
            "date": str(date.today()),
            "capacity": 10,
            "state": "completed",
        },
    ]

    for payload in event_payloads:
        response = client.post("/event/", headers=headers, json=payload)
        assert response.status_code == 200

    filtered_by_state = client.get(
        "/event/",
        headers=headers,
        params={"state": "scheduled", "min_capacity": 20},
    )
    assert filtered_by_state.status_code == 200
    data = filtered_by_state.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Backend Summit"

    invalid_state = client.get("/event/", headers=headers, params={"state": "invalid-state"})
    assert invalid_state.status_code == 400
