# AnimeLog AWS Infrastructure

## Local Development Setup

1. Install prerequisites:
   - AWS SAM CLI
   - Python 3.9
   - AWS CLI configured with credentials

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your MyAnimeList API credentials

3. Make scripts executable:
   ```bash
   chmod +x scripts/local.sh
   chmod +x scripts/deploy.sh
   ```

4. Run locally:
   ```bash
   ./local.sh
   ```
   The API will be available at http://127.0.0.1:3000

## Available endpoints
- Login: http://127.0.0.1:3000/auth/login 
- Callback: http://127.0.0.1:3000/auth/callback

## Deployment

To deploy to AWS:
```bash
./deploy.sh
```
