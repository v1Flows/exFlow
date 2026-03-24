# Runner
> This runner is the execution engine for JustFlow and is maintained inside the JustFlow monorepo.

## Table of Contents

- [Features](#features)
- [Configuration](#configuration)
- [Plugins](#plugins)
- [Modes](#modes)
- [Self Hosting](#self-hosting)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Modes**: The runner can be started in different modes which either offer full functionality or just be a standby listener for incoming alerts
- **Plugins**: Develop your own plugins or use our existing ones to extend the functionality of this Runner and JustFlow to your needs

## Configuration

To conntect an runner to JustFlow you first have to set them up and copy the runner_id and or the api key from the created project. As an Admin you can copy the Global Share Runner token from the admin view.

```yaml
---

log_level: info
mode: master

justflow:
  enabled: true
  url: https://justflow.app
  runner_id: null
  api_key: null

plugins:
  - name: alertmanager
    version: v1.2.4
  - name: git
    version: v1.2.0
  - name: ansible
    version: v1.3.2
  - name: ssh
    version: v1.4.0

api_endpoint:
  port: 8081
```

## Plugins
The runner can be extended by integrating plugins following a specific schema. The maintained plugins are located in the repository root under [runner-plugins](../../runner-plugins).

To develop your own plugin you can start with the local [template](../../runner-plugins/template).

## Modes

### Master
All components are enabled. The runner will receive payloads, process them and scan for pending jobs.

### Worker
The Worker mode will disable the payload receiver component. The runner will only act as an Job executor.

### Listener
The runner will only act as a payload receiver. There will be no components enable to scan or execute any jobs.

## Self Hosting
To host the Runner on your own infrastructure we publish images through GitHub Container Registry.
- **ghcr.io/justlabv1/justflow:runner-latest** - Latest version
- **ghcr.io/justlabv1/justflow:runner-vx.x.x** - Versioned release

```sh
docker run -p 8081:8081 -v /your/config/path/config.yaml:/app/config/config.yaml ghcr.io/justlabv1/justflow:runner-latest
```

## Contributing

We welcome contributions to this project! To contribute, follow these steps:

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
This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3. See the [LICENSE](https://github.com/JustLABv1/runner/blob/main/LICENSE) file for details.
