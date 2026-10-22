import urllib.request, urllib.error, json

def test(method, path, body=None):
    url = 'http://127.0.0.1:3001' + path
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'
    try:
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode()
            print(f'{method} {path} -> {resp.status} {body[:200]}')
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f'{method} {path} -> {e.code} {body[:200]}')
    except Exception as e:
        print(f'{method} {path} -> ERROR: {e}')

test('GET', '/health')
test('GET', '/db/health')
test('GET', '/openapi.json')
test('GET', '/docs')
test('GET', '/api/v1/health')
test('POST', '/api/v1/auth/register', {'email':'test@example.com','password':'SecurePass123','first_name':'Test','last_name':'User'})
test('POST', '/api/v1/auth/login', {'email':'test@example.com','password':'SecurePass123'})
test('POST', '/api/v1/auth/sms/request', {'phone':'+79991234567'})
test('POST', '/api/v1/auth/sms/verify', {'phone':'+79991234567','code':'0000'})
test('GET', '/api/v1/auth/me')
test('POST', '/api/v1/auth/refresh', {'refresh_token':'fake'})
test('POST', '/api/v1/auth/logout', {'refresh_token':'fake'})
test('GET', '/api/v1/patients')
test('POST', '/api/v1/practitioners/00000000-0000-0000-0000-000000000000/invite-codes')