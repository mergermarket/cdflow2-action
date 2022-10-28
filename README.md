# Github Action to run cdflow2

## Usage

See [action.yml](action.yml)

### Download tool

```yaml
steps:
  - uses: mergermarket/cdflow2-action@v3
```

This will download cdflow2 and make it available on the path, so you can simply run
`cdflow2` after that. It will attempt to install the downloaded cdflow2 into the tool cache.

You can specify a `version` input to get a specific cdflow2 version.

### Release

This also runs `cdflow2 release`

```yaml
steps:
  - uses: mergermarket/cdflow2-action@v3
    with:
      command: release
```

The action with synthesise an application version from the repo name, run number and latest revision SHA.

You would typically also specify AWS credentials in the environment here (referencing relevant secrets).

### Deploy/destroy

This also runs `cdflow2 deploy` or `cdflow2 destroy`

```yaml
steps:
  - uses: mergermarket/cdflow2-action@v3
    with:
      command: deploy
      environment: aslive
```

As with `release`, this will synthesise an application version. You can specify a `newState` input to pass
the `--new-state` option and/or a `planOnly` input to pass the `--plan-only` option.
