<p align="center">
<a href="https://buymeacoffee.com/justnz" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>


# JustFlow

JustFlow is a modern workflow automation platform, combining orchestration, execution, and a web interface in a single monorepo.

![Dashboard Image](https://github.com/JustLABv1/justflow/blob/develop/apps/frontend/public/images/full_dashboard.png?raw=true)

## Table of Contents

- [Features](#features)
- [Self Hosting & Setup](#self-hosting--setup)
- [Runners](#runners)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Release Conventions](#release-conventions)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Project Management**: Organize flows, invite members, and control access.
- **Flows**: Design and automate workflows visually.
- **Failure Pipelines**: Trigger recovery or alternative flows on errors.
- **Runners**: Execute flows, self-hosted or shared, extensible via plugins.
- **Scalability**: Scale JustFlow and runners to your workload.
- **Team Collaboration**: Invite team members, assign roles, manage permissions.
- **Audit Logs**: Track changes and activities for compliance and transparency.

## Self Hosting & Setup

JustFlow can be self-hosted using Docker, Docker Compose, or Helm. You can set up JustFlow using the new automated setup flow (recommended) or manually via configuration files.

**Note:** JustFlow requires a separately hosted PostgreSQL database. The main JustFlow image does not include a built-in database.

### Docker Images
- **ghcr.io/justlabv1/justflow:latest** – Full version (frontend + backend)
- **ghcr.io/justlabv1/justflow:vx.x.x** – Versioned releases
- **ghcr.io/justlabv1/justflow:frontend-latest** – Frontend only
- **ghcr.io/justlabv1/justflow:backend-latest** – Backend only
- **ghcr.io/justlabv1/justflow:runner-latest** – Runner only

### Setup Options

#### 1. Automated Setup (Recommended)
After starting JustFlow, visit the `/setup` page in your browser. The setup wizard will guide you through configuring database, encryption, and admin user. All settings are stored securely and can be updated later in the admin area.

#### 2. Environment Variables
You can configure JustFlow using environment variables for backend and frontend. See the documentation for all available variables.

#### 3. Manual Configuration (Advanced)
You can still use a manual `config.yaml` for backend configuration. Mount your config file into the container:

```sh
docker run -p 8080:8080 -v /your/config/path/config.yaml:/etc/justflow/config.yaml ghcr.io/justlabv1/justflow:latest
```

Example config: [apps/backend/config/config.yaml](apps/backend/config/config.yaml)

### Docker Compose
Use our [docker-compose.yaml](https://github.com/JustLABv1/justflow/blob/main/docker-compose.yaml) for a quick start. It includes PostgreSQL and the full JustFlow image. You can use the setup wizard or mount your own config file as described above.

### Helm Chart
Deploy JustFlow with our Helm chart, which supports integrated setup and runner management. See the [Helm Repo](https://github.com/JustLABv1/helm-charts) for details.

### Frontend Only
To run only the frontend, provide the backend endpoint via environment variable:
```sh
docker run -p 80:3000 -e NEXT_PUBLIC_API_URL=https://api-url.com ghcr.io/justlabv1/justflow:frontend-latest
```

### Backend Only
```sh
docker run -p 80:3000 -v /your/config/path/config.yaml:/etc/justflow/config.yaml ghcr.io/justlabv1/justflow:backend-latest
```

## Runners

JustFlow uses the v1Flows Runner as its execution engine. At least one runner must be connected for flows to run. You can add runners via the setup wizard, project settings, or the admin runner page.

The runner source now lives in [apps/runner](apps/runner). Built-in and maintained plugins live in [runner-plugins](runner-plugins).

## Project Structure


The project structure is organized as follows:

- **apps/backend**: API, business logic, database, configuration
- **apps/frontend**: Next.js frontend
- **apps/runner**: Runner service and release artifacts
- **runner-plugins**: Action and endpoint plugins, each with its own Go module
- **pkg/contracts**: Shared transport types used by runner and plugins


## Local Development

To develop JustFlow locally, you can use either the automated setup or manual config file:

### Backend

1. Clone the repository:
    ```sh
    git clone git@github.com:v1Flows/JustFlow.git
    cd justflow
    ```

2. Install dependencies:
    ```sh
    cd apps/backend && go mod download
    ```

3. Start the backend:
    - **Automated Setup:**
      ```sh
      go run main.go
      ```
      Then visit `http://localhost:8080/setup` in your browser to complete the setup wizard.
    - **Manual Config:**
      Create your `config.yaml` (see example above) and run:
      ```sh
      go run main.go --config config/config.yaml
      ```

### Runner

1. Navigate to the runner directory:
    ```sh
    cd apps/runner
    ```

2. Install dependencies:
    ```sh
    go mod download
    ```

3. Start the runner:
    ```sh
    go run ./cmd/runner --config config/config.yaml
    ```

### Frontend

1. Navigate to the frontend directory:
    ```sh
    cd apps/frontend
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Create a `.env.local` file and add the backend API URL:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:8080"
    ```

4. Start the development server:
    ```sh
    pnpm dev
    ```

## Release Conventions

- **JustFlow app releases**: push tags like `justflow-v1.2.3`
- **Runner releases**: push tags like `runner-v1.2.3`
- **Plugin releases**: update a plugin `.version` file on `main` or `develop`
- **Manual image builds**: use the root `Build Docker Images Manually` workflow

All active CI and release workflows live in the root `.github/workflows` directory.


## Contributing

We welcome contributions! To get started:
1. Fork the repository.
2. Create a new branch:
    ```sh
    git checkout -b feature/your-feature-name
    ```
3. Make your changes and commit:
    ```sh
    git commit -m "Add your commit message"
    ```
4. Push your branch:
    ```sh
    git push origin feature/your-feature-name
    ```
5. Open a pull request on GitHub.


## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3. See the [LICENSE](https://github.com/v1Flows/JustFlow/blob/main/LICENSE) for details.
