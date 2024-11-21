import json
import urllib.parse
import urllib.request
import os
import base64
from urllib.error import HTTPError

CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']
REDIRECT_URI = os.environ['REDIRECT_URI']

def exchange_code_for_token(code, code_verifier):
    """Exchange authorization code for access token"""
    token_data = {
        'code': code,
        'code_verifier': code_verifier,
        'grant_type': 'authorization_code',
        'redirect_uri': REDIRECT_URI
    }
    
    auth_string = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {auth_string}',
        'User-Agent': 'MyAnimeList OAuth Client'
    }
    
    request = urllib.request.Request(
        'https://myanimelist.net/v1/oauth2/token',
        data=urllib.parse.urlencode(token_data).encode('utf-8'),
        headers=headers
    )
    
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode('utf-8'))

def lambda_handler(event, context):
    """Handle OAuth callback and token exchange"""
    params = event.get('queryStringParameters', {})
    code = params.get('code')
    state = params.get('state')
    
    try:
        state_data = json.loads(base64.urlsafe_b64decode(state).decode())
        code_verifier = state_data.get('code_verifier')
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f'Invalid state parameter: {str(e)}'})
        }
    
    if not code or not code_verifier:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing code or code_verifier'})
        }
        
    try:
        token_response = exchange_code_for_token(code, code_verifier)
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'access_token': token_response.get('access_token'),
                'refresh_token': token_response.get('refresh_token'),
                'expires_in': token_response.get('expires_in')
            })
        }
    except HTTPError as e:
        error_body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        return {
            'statusCode': e.code,
            'body': json.dumps({'error': error_body})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }