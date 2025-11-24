# JustFlow Backend Detection & Setup Guide

## Problem

When running JustFlow in a Docker container (including Kubernetes), the setup wizard cannot automatically discover the backend service because:

1. **Browser Limitations**: The frontend runs in the browser, and `localhost` refers to the user's machine, not the container
2. **Network Isolation**: Kubernetes service names only work from within the cluster (pod-to-pod communication)
3. **CORS Issues**: Browser requests to internal services may fail due to CORS or network policies

## Solution

The setup process now uses a **hybrid detection approach**:

### Server-Side Detection
- **Endpoint**: `/api/setup/detect-backend`
- **Purpose**: Runs from the Node.js server, which has access to internal services
- **Checks**:
  1. `BACKEND_URL` environment variable (highest priority)
  2. Docker service names: `justflow-backend:8080`, `backend:8080`, `localhost:8080`
  3. Direct localhost connections

### Browser-Accessible URL Resolution
- Even if the backend is found internally, the frontend needs a URL it can access
- The API determines the browser-accessible URL based on:
  1. `BACKEND_URL` environment variable
  2. `NEXT_PUBLIC_API_URL` environment variable
  3. Request hostname with port 8080 fallback

## Usage

### Docker (Compose & Standalone)

```bash
docker run -p 3000:3000 -p 8080:8080 \
  -e BACKEND_URL=http://localhost:8080 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  -v /path/to/config:/etc/justflow \
  justflow
```

### Kubernetes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: justflow
spec:
  containers:
  - name: justflow
    image: justflow:latest
    ports:
    - containerPort: 3000
      name: frontend
    - containerPort: 8080
      name: backend
    env:
    # IMPORTANT: Use the service DNS name for internal communication
    - name: BACKEND_URL
      value: "http://justflow-backend:8080"
    # IMPORTANT: Use the ingress/external URL for browser access
    - name: NEXT_PUBLIC_API_URL
      value: "http://justflow.example.com/api"
    volumeMounts:
    - name: config
      mountPath: /etc/justflow
  volumes:
  - name: config
    configMap:
      name: justflow-config
```

### Manual Setup (if auto-detection fails)

If the auto-detection still doesn't work:

1. **Ensure Backend is Running**: Verify the backend is accessible at the URL you intend to use
2. **Set Environment Variables**: Configure before starting:
   ```bash
   export BACKEND_URL="http://your-backend-host:8080"
   export NEXT_PUBLIC_API_URL="http://your-backend-host:8080"
   ```
3. **Manual URL Entry**: In the setup wizard, use "Connect manually" and enter the URL directly

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BACKEND_URL` | `http://localhost:8080` | Internal server-side URL to reach backend |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Browser-accessible URL for API requests |
| `BACKEND_PORT` | `8080` | Port where backend listens |
| `BACKEND_HOST` | `localhost` | Hostname for backend detection |

## Troubleshooting

### Error: "Backend was found internally but is not accessible from the browser"

**Cause**: The server found the backend but the browser cannot reach it

**Solutions**:
1. Ensure the backend is exposed on a port accessible from your machine/browser
2. If using Kubernetes with an Ingress, configure `NEXT_PUBLIC_API_URL` to point to your ingress hostname
3. Check firewall rules and ensure port 8080 is open

### Error: "No backend services found"

**Cause**: The detection endpoint couldn't reach any backend

**Solutions**:
1. Verify the backend service is running: `curl http://localhost:8080/api/v1/health`
2. Check if you're running in Docker/Kubernetes and set `BACKEND_URL` explicitly
3. For Kubernetes, ensure the service DNS is correct (usually `service-name:port` or `service-name.namespace.svc.cluster.local:port`)

### Auto-detection not finding backend in Docker Compose

**Solution**: Use the service name defined in `docker-compose.yml`:
```yaml
version: '3'
services:
  backend:
    image: justflow-backend
    ports:
      - "8080:8080"
  
  frontend:
    image: justflow
    environment:
      BACKEND_URL: "http://backend:8080"
      NEXT_PUBLIC_API_URL: "http://localhost:8080"
    ports:
      - "3000:3000"
```

## How the Detection Works

### Step 1: Server-Side Check
```
Client clicks "Auto-Detect Backend"
  ↓
Calls `/api/setup/detect-backend` (server-side)
  ↓
Server checks:
  - BACKEND_URL env var
  - Docker service names (justflow-backend:8080, backend:8080, etc.)
  - localhost:8080
  ↓
Returns: { detected: [...], browserAccessibleUrl: "..." }
```

### Step 2: Browser Verification
```
Frontend receives detected services
  ↓
Tries to reach browserAccessibleUrl from browser
  ↓
If successful: Uses this URL for API calls
If failed: Shows error with guidance
```

## Integration with Auto-Discovery

When the setup completes, the configured backend URL is saved and used for all subsequent API calls in the application.
