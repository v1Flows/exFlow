# Release Notes

## [Version 1.3.1] - 2025-05-29

### ⚠️ Breaking Changes ⚠️
With version 1.1.0 the config format has change to be compliant with the default yaml formatting.
Please have a look at the [default config](https://github.com/v1Flows/exFlow/blob/develop/services/backend/config/config.yaml) and align to your current config accordingly. 

### Added
- nothing added

### Changed
- nothing changes

### Fixed
- dashboard and executions did not load when the amount of executions were greater than 500+. Implemented an limit, offset and status filter on the backend db select

### Known Issues
- No known issues at this time.

---

*Thank you for using exFlow!*