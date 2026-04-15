from fastapi.testclient import TestClient


def _find_user_id_by_email(users: list[dict], email: str) -> int:
    for user in users:
        if user["email"] == email:
            return user["id"]
    raise AssertionError(f"No se encontró usuario con email {email}")


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


def test_admin_role_handover_and_access_control(client: TestClient) -> None:
    admin_register = client.post(
        "/auth/register",
        json={
            "email": "admin-root@example.com",
            "password": "12345678",
            "name": "Admin Root",
            "role": "admin",
        },
    )
    assert admin_register.status_code == 200
    admin_token = admin_register.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    user_register = client.post(
        "/auth/register",
        json={
            "email": "user-ops@example.com",
            "password": "12345678",
            "name": "User Ops",
            "role": "usuario",
        },
    )
    assert user_register.status_code == 200

    list_before = client.get("/auth/list/users", headers=admin_headers)
    assert list_before.status_code == 200
    user_ops_id = _find_user_id_by_email(list_before.json(), "user-ops@example.com")

    promote_response = client.put(
        f"/auth/role/{user_ops_id}",
        headers=admin_headers,
        json={"role": "admin"},
    )
    assert promote_response.status_code == 200
    assert promote_response.json()["logout_required"] is True

    # El admin anterior fue degradado y ya no puede acceder a endpoints exclusivos de admin.
    stale_admin_access = client.get("/auth/list/users", headers=admin_headers)
    assert stale_admin_access.status_code == 403

    new_admin_login = client.post(
        "/auth/login",
        json={"email": "user-ops@example.com", "password": "12345678"},
    )
    assert new_admin_login.status_code == 200
    new_admin_headers = {"Authorization": f"Bearer {new_admin_login.json()['access_token']}"}

    list_after = client.get("/auth/list/users", headers=new_admin_headers)
    assert list_after.status_code == 200
    assert all(user["email"] != "user-ops@example.com" for user in list_after.json())
