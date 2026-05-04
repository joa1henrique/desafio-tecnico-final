Test instructions for backend integration tests

1. Start Docker (Postgres) for the project

```bash
docker compose up -d
```

2. Reset database and seed (this will drop data and run the seed script)

```bash
npx prisma migrate reset --force
npm run prisma:seed
```

3. Install dev dependencies (first time)

```bash
npm install
```

4. Run tests

```bash
npm test
# or for CI / serial run
npm run test:ci
```

Notes:
- Ensure `backend/.env` contains `DATABASE_URL`, `JWT_SECRET` and `COOKIE_NAME` before running tests.
- The test setup loads `backend/.env` automatically via Jest setup.
