# Release Notes

## [Version 1.2.0] - 2025-05-20

### ⚠️ Breaking Changes ⚠️
With version 1.1.0 the config format has change to be compliant with the default yaml formatting.
Please have a look at the [default config](https://github.com/v1Flows/exFlow/blob/develop/services/backend/config/config.yaml) and align to your current config accordingly. 

### Added
- Added postgresql-client to docker image to support db ready checks
- Copy entire flows
- Copy flow & failure pipeline actions (also to different flows)
- Validate the user token at middleware level
- Schedule flows to execute every x minutes,hours,...

### Changed
- Modals now align on an common design schema

### Fixed
- Persistent runners will not be deleted any longer even when they are not healthy
- The automatic execution health checker will keep the previous step messages
- Navbar appearance

### Known Issues
- No known issues at this time.

---

*Thank you for using exFlow!*