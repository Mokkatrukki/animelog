import json
import urllib.parse
import os
import base64
import secrets
import string

CLIENT_ID = os.environ['CLIENT_ID']
REDIRECT_URI = os.environ['REDIRECT_URI']

def generate_code_verifier():
    """Generate code verifier per RFC 7636"""
    allowed = string.ascii_letters + string.digits + "-._~"
    return ''.join(secrets.choice(allowed) for _ in range(43))

def create_auth_url(code_verifier):
    """Create MyAnimeList authorization URL with PKCE"""
    state = base64.urlsafe_b64encode(json.dumps({
        "state": "RandomStateString",
        "code_verifier": code_verifier
    }).encode()).decode()
    
    auth_params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'code_challenge': code_verifier,
        'code_challenge_method': 'plain',
        'state': state
    }
    
    return 'https://myanimelist.net/v1/oauth2/authorize?' + urllib.parse.urlencode(auth_params)

def lambda_handler(event, context):
    """Handle OAuth login request"""
    code_verifier = generate_code_verifier()
    auth_url = create_auth_url(code_verifier)
    
    return {
        'statusCode': 302,
        'headers': {
            'Location': auth_url,
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps({'url': auth_url})
    }