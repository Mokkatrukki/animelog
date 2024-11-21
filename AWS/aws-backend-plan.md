# AnimeLog AWS Backend Development Plan

## Project Overview
AnimeLog backend handles synchronization between Crunchyroll watch history and MyAnimeList. It provides secure authentication, efficient data storage, and reliable sync mechanisms.

## Infrastructure Components

### API Structure
```
/api/
  |-- /auth/                   # Authentication endpoints
  |     |-- /login             # Initiates MAL OAuth
  |     |-- /callback          # Handles OAuth response
  |     `-- /refresh           # Token refresh
  |
  |-- /sync/                   # Sync management
  |     |-- /process           # Process CR history
  |     `-- /status            # Check sync status
  |
  |-- /series/                 # Series operations
  |     |-- /match             # Find MAL matches
  |     |-- /update            # Update MAL status
  |     `-- /info              # Get series info
  |
  `-- /user/                   # User operations
        |-- /settings          # User preferences
        `-- /history           # Sync history
```

### DynamoDB Schema
```
[cr_anime_table]
|- cr_title (PK)              # Crunchyroll title
|- user_id (SK)               # User identifier
|- seasons: [                 # Season/episode data
    {
      number: number,
      episodes: [
        {
          number: number,
          status: string,
          lastWatched: string,
          duration: string
        }
      ]
    }
  ]
|- last_updated              # Last modification timestamp
|- mal_id                    # MyAnimeList ID if matched
|- sync_status               # Current sync state

[mal_mapping]
|- mal_id (PK)              # MyAnimeList ID
|- cr_title                 # Crunchyroll title
|- confidence               # Match confidence score

[user_tokens]
|- user_id (PK)             # User identifier
|- access_token             # MAL access token
|- refresh_token            # MAL refresh token
|- expires_at               # Token expiration time

[user_sync_status]
|- user_id (PK)             # User identifier
|- last_sync                # Last sync timestamp
|- pending_updates          # Pending sync operations
```

## Development Phases

### Phase 1: Infrastructure Setup
- [ ] AWS Account Configuration
  - [ ] Create development account
  - [ ] Set up IAM roles and policies
  - [ ] Configure AWS CLI

- [ ] Basic Infrastructure
  - [x] Create API Gateway
  - [x] Set up first Lambda
  - [ ] Create DynamoDB tables
  - [x] Test basic connectivity

### Phase 1.5: Local Setup
- [x] Set up AWS SAM CLI
- [x] Configure local DynamoDB
- [x] Use environment variables
- [x] Test with SAM local

### Phase 2: Authentication Implementation
- [x] OAuth Flow
  - [x] Login Lambda
  - [x] Callback Lambda
  - [ ] Token storage
  - [ ] CORS configuration

- [ ] Token Management
  - [ ] Token refresh mechanism
  - [ ] Token validation
  - [ ] Error handling

### Phase 3: Core Functionality
- [ ] Series Management
  - [ ] MAL series lookup
  - [ ] Series matching logic
  - [ ] Update mechanisms
  - [ ] Batch operations

- [ ] Sync Processing
  - [ ] History processing
  - [ ] Status tracking
  - [ ] Rate limiting
  - [ ] Error recovery

### Phase 4: User Features
- [ ] User Management
  - [ ] Settings storage
  - [ ] Preferences
  - [ ] Sync history
  - [ ] Data export/import

## Technical Requirements

### Environment Variables
```
# Required for all environments
MAL_CLIENT_ID=xxx
MAL_CLIENT_SECRET=xxx
REDIRECT_URI=xxx
AWS_REGION=xxx

# Optional for development
DEBUG=true
STAGE=dev
```

### AWS Resource Naming
```
# Lambda Functions
${project}-${stage}-auth-login
${project}-${stage}-auth-callback
${project}-${stage}-series-handler
${project}-${stage}-sync-handler
${project}-${stage}-user-handler

# DynamoDB Tables
${project}-${stage}-user-tokens
${project}-${stage}-series-data
${project}-${stage}-mal-mappings
```

## Testing Strategy

### Unit Tests
- [ ] Lambda function tests
- [ ] DynamoDB operations
- [ ] MAL API integration
- [ ] Error handling

### Integration Tests
- [ ] Complete OAuth flow
- [ ] Sync process
- [ ] Series updates
- [ ] User operations

### Load Tests
- [ ] API Gateway limits
- [ ] Lambda concurrency
- [ ] DynamoDB capacity
- [ ] MAL API limits

## Security Considerations

### Authentication
- [ ] Token storage security
- [ ] API Gateway authorization
- [ ] Lambda permissions
- [ ] CORS policies

### Data Protection
- [ ] DynamoDB encryption
- [ ] Secure token storage
- [ ] API access control
- [ ] Error response sanitization

## Monitoring and Maintenance

### CloudWatch Setup
- [ ] Lambda metrics
- [ ] API Gateway monitoring
- [ ] DynamoDB capacity monitoring
- [ ] Error tracking

### Alerts
- [ ] Error rate thresholds
- [ ] Capacity warnings
- [ ] Token expiration
- [ ] Sync failures

## Development Workflow

### Local Development
1. Set up AWS SAM CLI
2. Configure local DynamoDB
3. Use environment variables
4. Test with SAM local

### Deployment Process
1. Test in development
2. Deploy to staging
3. Run integration tests
4. Deploy to production

### Version Control
- Use feature branches
- Pull request reviews
- Version tagging
- Changelog maintenance

## Documentation Needs

### API Documentation
- [ ] Endpoint specifications
- [ ] Request/response examples
- [ ] Error codes
- [ ] Rate limits

### Setup Documentation
- [ ] Infrastructure setup
- [ ] Development environment
- [ ] Deployment process
- [ ] Testing procedures

## Performance Optimization

### Caching Strategy
- API Gateway caching
- DynamoDB DAX (if needed)
- Lambda optimization
- Response compression

### Rate Limiting
- MAL API limits
- User request limits
- Sync operation limits
- Error retry backoff

## Known Limitations
1. MAL API rate limits
2. Lambda cold starts
3. DynamoDB throughput
4. OAuth token expiration

## Future Enhancements
1. Batch sync operations
2. Advanced matching algorithms
3. User statistics
4. Custom sync rules

## Support and Maintenance
- Error logging strategy
- User support process
- Backup procedures
- Recovery plans

