from fastapi.testclient import TestClient


def test_register_and_login(client: TestClient) -> None:
    register_response = client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "12345678",
            "name": "Admin",
            "role": "admin",
        },
    )
    assert register_response.status_code == 200
    assert "access_token" in register_response.json()

    login_response = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "12345678"},
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
