# Mobile build versioning

- Use `pubspec.yaml` as the single source of truth for the app version and build number. Do not increase APK/AAB versions only through a temporary `--build-number` override.
- Before creating a newer numbered build, update the build number in `pubspec.yaml` to exceed the previously distributed build and any known Play Console version. Rebuilding the same local test version can keep the same number.
