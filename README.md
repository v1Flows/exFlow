<p align="center">
<a href="https://buymeacoffee.com/justnz" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>

# exFlow

exFlow is a workflow automation platform like Jenkins but beautiful. This repository contains both the frontend and backend code for the exFlow application.

![Dashboard Image](https://github.com/v1Flows/exFlow/blob/develop/services/frontend/public/images/full_dashboard.png?raw=true)

## Demo
There is an demo of exFlow available where you can test things out and get yourself an picture of this project. <br />
**Please do not use this for real life cases nor put any sensitive informations in there.**

Use the following details: 
- URL: [exFlow](https://exflow.org)
- Username: Demo
- Password: demo123

## Table of Contents

- [Features](#features)
- [Self Hosting](#self-hosting)
- [Runners](#runners)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Project Management**: Projects combine a number of Flows and add the option to invite members and control their access.
- **Flows**: Create flows to design workflows / automations.
- **Failure Pipelines**: Trigger separate pipelines in case your flows fail and recover in case needed.
- **Runners**: Runners execute your flows. They can also be self-hosted and expanded with plugins.
- **Shared Runners**: Create runners which can be used for all projects across the platform.
- **Scalable to your Needs**: Scale exFlow and the runners according to your workload.
- **Team Collaboration**: Invite team members, assign roles, and manage permissions.
- **Audit Logs**: Track changes and activities within projects and flows.

## Self Hosting
To run your own version of exFlow we provide various docker images available at 
[Docker Hub](https://hub.docker.com/repository/docker/justnz/exflow/general).
- **justnz/exflow:latest** - Full version including frontend and backend
- **justnz/exflow:vx.x.x** - Versioned release. Also available for the single frontend and backend images
- **justnz/exflow:frontend-latest** - Only frontend
- **justnz/exflow:backend-latest** - Only backend

### Helm Chart
We also offer an Helm Chart for exFlow which includes exFlow itself, an postgres and the option for project/shared runners. <br />
Visit our [Helm Repo](https://github.com/v1Flows/helm-charts/tree/main) for more details

### Full Version

Config example: [config.yaml](https://github.com/v1Flows/exFlow/blob/main/services/backend/config/config.yaml)

```sh
docker run -p 80:3000 -v /your/config/path/config.yaml:/etc/exflow/backend_config.yaml justnz/exflow:latest
```

### Frontend Only
If you want to run only the frontend of exFlow, please provide the backend endpoint via the below env flag.
```sh
docker run -p 80:3000 -e NEXT_PUBLIC_API_URL=https://api-url.com justnz/exflow:frontend-latest
```

### Backend Only
```sh
docker run -p 8080:8080 -v /your/config/path/config.yaml:/etc/exflow/backend_config.yaml justnz/exflow:backend-latest
```

## Runners
The execution engine of exFlow is the v1Flows Runner. This component provides the functionality as a workflow engine and will execute your flows.

To create / run your own runners you're require to have a fully set up exFlow instance.

Please see the repo [Runner](https://github.com/v1Flows/runner) for more informations.

## Project Structure

The project structure is organized as follows:

- **backend**: Contains the backend code for handling API requests, database interactions, and business logic.
- **frontend**: Contains the frontend code for the user interface, including components, pages, and styles.

## Local Development

To get started with the exFlow project, follow these steps:

### Backend

1. Clone the repository:
    ```sh
    git clone git@github.com:v1Flows/exFlow.git
    cd exflow
    ```

2. Install dependencies:
    ```sh
    cd services/backend && go mod download
    ```

3. Create a [config.yaml](https://github.com/v1Flows/exFlow/blob/main/services/backend/config/config.yaml) file and add the necessary configuration:
    ```yaml
    LogLevel: info

    Port: 8080

    Database:
      Server: localhost
      Port: 5432
      Name: postgres
      User: postgres
      Password: postgres

    Encryption:
      Enabled: true
      # max length 32
      Key: your-encryption-key

    JWT:
      Secret: your-jwt-secret
    ```

4. Build and run the backend server:
    ```sh
    $ go build -o exflow-backend
    $ ./exflow-backend --config config/config.yaml
    ```

### Frontend

1. Navigate to the frontend directory:
    ```sh
    cd services/frontend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env.local` file and add the necessary environment variables:
    ```env
    NEXT_PUBLIC_API_URL="https://your-api-url.com"
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

## Contributing

We welcome contributions to the exFlow project! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```sh
    git checkout -b feature/your-feature-name
    ```
3. Make your changes and commit them:
    ```sh
    git commit -m "Add your commit message"
    ```
4. Push to the branch:
    ```sh
    git push origin feature/your-feature-name
    ```
5. Open a pull request on GitHub.

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3. See the [LICENSE](https://github.com/v1Flows/exFlow/blob/main/LICENSE) file for details.
