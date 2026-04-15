from datetime import date

from fastapi.testclient import TestClient

from conftest import auth_headers


def _get_user_id_by_email(client: TestClient, headers: dict[str, str], email: str) -> int:
    response = client.get("/auth/users/search", headers=headers, params={"q": email})
    assert response.status_code == 200
    items = response.json()["items"]
    for item in items:
        if item["email"] == email:
            return item["id"]
    raise AssertionError(f"No se encontró usuario con email {email}")


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


def test_assistant_role_transitions_and_removal_permissions(client: TestClient) -> None:
    owner_headers = auth_headers(client, "owner-staff@example.com", "12345678", "Owner Staff")
    create_event = client.post(
        "/event/",
        headers=owner_headers,
        json={
            "title": "Evento Staff",
            "description": "Prueba de permisos de staff",
            "date": str(date.today()),
            "capacity": 5,
            "state": "scheduled",
        },
    )
    assert create_event.status_code == 200
    event_id = create_event.json()["id"]

    assistant_headers = auth_headers(client, "assistant@example.com", "12345678", "Assistant")
    attendee_headers = auth_headers(client, "attendee@example.com", "12345678", "Attendee")

    assistant_id = _get_user_id_by_email(client, owner_headers, "assistant@example.com")
    attendee_id = _get_user_id_by_email(client, owner_headers, "attendee@example.com")

    assign_assistant = client.post(
        f"/event/{event_id}/register/{assistant_id}",
        headers=owner_headers,
        json={"role": "asistente"},
    )
    assert assign_assistant.status_code == 200
    assert assign_assistant.json()["role"] == "asistente"

    # Un asistente no puede añadir gente con rol asistente directamente.
    assistant_add_assistant = client.post(
        f"/event/{event_id}/register/{attendee_id}",
        headers=assistant_headers,
        json={"role": "asistente"},
    )
    assert assistant_add_assistant.status_code == 403

    assistant_add_user = client.post(
        f"/event/{event_id}/register/{attendee_id}",
        headers=assistant_headers,
        json={"role": "usuario"},
    )
    assert assistant_add_user.status_code == 200
    assert assistant_add_user.json()["role"] == "usuario"

    promote_to_assistant = client.put(
        f"/event/{event_id}/register/{attendee_id}",
        headers=assistant_headers,
        json={"role": "asistente"},
    )
    assert promote_to_assistant.status_code == 200
    assert promote_to_assistant.json()["role"] == "asistente"

    # Un asistente no puede eliminar inscripciones de otras personas.
    assistant_remove_other = client.delete(
        f"/event/{event_id}/register/{attendee_id}",
        headers=assistant_headers,
    )
    assert assistant_remove_other.status_code == 403

    # Pero sí puede abandonar su propio rol de asistente.
    assistant_self_demote = client.put(
        f"/event/{event_id}/register/{assistant_id}",
        headers=assistant_headers,
        json={"role": "usuario"},
    )
    assert assistant_self_demote.status_code == 200
    assert assistant_self_demote.json()["role"] == "usuario"

    # Ya sin rol asistente, no puede gestionar staff.
    assistant_no_longer_staff = client.post(
        f"/event/{event_id}/register/{attendee_id}",
        headers=assistant_headers,
        json={"role": "usuario"},
    )
    assert assistant_no_longer_staff.status_code == 403

    # El participante aún puede abandonar el evento por su cuenta.
    attendee_leave = client.delete(f"/event/{event_id}/register/me", headers=attendee_headers)
    assert attendee_leave.status_code == 200
