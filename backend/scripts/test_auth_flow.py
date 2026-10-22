import urllib.request, urllib.error, json

def test(method, path, body=None, token=None):
    url = 'http://127.0.0.1:3001' + path
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'
    if token:
        headers['Authorization'] = f'Bearer {token}'
    try:
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode()
            print(f'{method} {path} -> {resp.status} {body[:300]}')
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f'{method} {path} -> {e.code} {body[:300]}')
        return e.code, json.loads(body) if body else {}
    except Exception as e:
        print(f'{method} {path} -> ERROR: {e}')
        return None, {}

# Register new user
status, data = test('POST', '/api/v1/auth/register', {
    'email': f'audit{__import__("uuid").uuid4()}@example.com',
    'password': 'SecurePass123',
    'first_name': 'Audit',
    'last_name': 'User'
})

if status == 201:
    token = data['data']['access_token']
    refresh = data['data']['refresh_token']
    print(f'\nGot access token: {token[:30]}...')
    
    # Test /me
    test('GET', '/api/v1/auth/me', token=token)
    
    # Test logout
    test('POST', '/api/v1/auth/logout', {'refresh_token': refresh}, token=token)
    
    # Test login
    test('POST', '/api/v1/auth/login', {
        'email': data.get('email', 'unknown'),
        'password': 'SecurePass123'
    })