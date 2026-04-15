from datetime import date, datetime, timedelta

from fastapi.testclient import TestClient

from conftest import auth_headers


def test_create_event_session_with_schedule_validation(client: TestClient) -> None:
    headers = auth_headers(client, "session-owner@example.com", "12345678", "Session Owner")

    create_event_response = client.post(
        "/event/",
        headers=headers,
        json={
            "title": "Evento con Sesiones",
            "description": "Agenda del evento",
            "date": str(date.today()),
            "capacity": 50,
            "state": "scheduled",
        },
    )
    event_id = create_event_response.json()["id"]

    start_time = datetime.utcnow()
    end_time = start_time + timedelta(hours=1)

    session_response = client.post(
        f"/event/{event_id}/sessions",
        headers=headers,
        json={
            "title": "Sesion 1",
            "speaker": "Ponente 1",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "capacity": 30,
        },
    )
    assert session_response.status_code == 200

    overlap_response = client.post(
        f"/event/{event_id}/sessions",
        headers=headers,
        json={
            "title": "Sesion 2",
            "speaker": "Ponente 2",
            "start_time": (start_time + timedelta(minutes=30)).isoformat(),
            "end_time": (end_time + timedelta(minutes=30)).isoformat(),
            "capacity": 20,
        },
    )
    assert overlap_response.status_code == 400
