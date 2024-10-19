# BIT-ToDo

## Running the project

### Docker

### Local

#### Frontend (Bun is not required but recommended)

```bash
cd frontend
bun install
bun run build
bun run preview
```

#### Backend (Bun is required for the backend to work (password hashing))

```bash
cd backend
bun install
bun start
```

#### Database

```bash
cd backend
docker-compose up -d
```
