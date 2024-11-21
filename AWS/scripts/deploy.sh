
#!/bin/bash
source .env

sam deploy \
  --parameter-overrides \
  MalClientId=$MAL_CLIENT_ID \
  MalClientSecret=$MAL_CLIENT_SECRET \
  RedirectUri=$REDIRECT_URI