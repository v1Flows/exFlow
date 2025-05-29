# Release Notes

## [Version 1.3.0] - 2025-05-29

### ⚠️ Breaking Changes ⚠️
With version 1.1.0 the config format has change to be compliant with the default yaml formatting.
Please have a look at the [default config](https://github.com/v1Flows/exFlow/blob/develop/services/backend/config/config.yaml) and align to your current config accordingly. 

### Added
- entrypoint check to docker-compose to check if db is ready
- new styles for executions list and execution steps
- plugin parameter depends_on. You can now add depends_on to plugin parameters to set conditional rendering
- admins can now delete shared runners
- on the backend config you can now set `runner.shared_runner_secret` and if that value matches what is configured in the runner config you dont have to use an api_key for the runner
- check for stuck execution steps
- deployment-examples in the root of the repo

### Changed
- switched some modals to forms to validate the input and make required inputs work

### Fixed
- some improvements for ui elemements on mobile & tablet view

### Known Issues
- No known issues at this time.

---

*Thank you for using exFlow!*