# Profile data api

Deployed at: https://stats-service.onrender.com/api-docs/

## Getting started

- create `.env` file in the root of the project with the following content:
```
DATABASE_URL=[database url]
SERVICE_URL=http://localhost:3000
```
- `npm install`
- `npm run gen`
- `npm run dev`

## The plan:
- [x] API written in Typescript with Express
- [x] OpenAPI + Swagger interface
- [x] Instagram profile data
- [x] Lens protocol profile data
---
Bonus
- [x] Persistance / Cache
- [ ] Frontend
- [ ] Auth

### The API
- `/stats/instagram/{handle}` - returns Instagram profile data
- `/stats/lens/{handle}` - returns Lens profile data
- `/api-docs` - Swagger UI


## Notes

- Instagram and Lens were chosen because they both have public APIs. Might add another one that needs authorization later.