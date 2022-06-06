# API

## Endpoints

### Endpoints for athlete data (for use by frontend)

- (GET) /allAthletes/:week --> This will return all stats of all athletes for any given week.
- (GET) /athlete/:name --> Returns all of an athletes stats for each week

### Other endpoints

- (PUT) /athleteData --> Pushes the athlete data to DB. This is called by the addAthletesStats script. You should never be calling this yourself.
- (DELETE) /clearWholeDB --> Clears the entire collection permanently. Only for testing.

#### Base URL:

https://teamdiff-backend-api.vercel.app/api/
