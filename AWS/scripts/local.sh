
#!/bin/bash
source .env

sam local start-api \
  --parameter-overrides \
  MalClientId=$MAL_CLIENT_ID \
  MalClientSecret=$MAL_CLIENT_SECRET \
  RedirectUri=$REDIRECT_URI \
  --warm-containers EAGER