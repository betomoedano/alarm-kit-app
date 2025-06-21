# Alarm Kit App

This is an Expo React Native application with a custom alarm scheduling module.

## Project Structure

- `app/` - Main application screens using Expo Router
  - `index.tsx` - Main alarm interface
  - `permissions.tsx` - Permission handling screen
  - `_layout.tsx` - Root layout
- `modules/expo-alarm-kit/` - Custom Expo module for alarm functionality
  - `ios/` - Native iOS implementation
  - `src/` - TypeScript module interface
  - `plugin/` - Expo config plugin
- `assets/` - Static assets (images, fonts)

## Key Features

- Custom alarm scheduling with native iOS implementation
- Permission handling for notifications
- TypeScript throughout

## Module Architecture

We are building a new expo module using https://docs.expo.dev/modules/module-api/

The module we are building is for the new AlarmKit https://developer.apple.com/documentation/alarmkit

Our goal is to expose the api, always follow official docs, follow best practices.

## Development Plans

See the `plans/` folder for detailed step-by-step development guides:

- [Plan 001](./plans/001-fix-scheduled-alarms-list.md) - Fix getAllScheduledAlarmsAsync bug 🐛
- [Plan 002](./plans/002-add-js-parameters.md) - Add JavaScript parameters for alarm scheduling
- [Plan 003](./plans/003-naming-conventions.md) - Rename to match AlarmManager conventions  
- [Plan 004](./plans/004-pause-cancel-alarms.md) - Add pause/cancel alarm functionality
- [Plan 005](./plans/005-customize-alarm-attributes.md) - Customize alarm attributes and presentation
- [Plan 006](./plans/006-observe-state-changes.md) - Observe and react to alarm state changes

## Current Status

- [x] Expose permissions function
- [x] Schedule a dummy notification
- [ ] Get a list of schedule notifications (Plan 001 - has bug to fix)

The expo-alarm-kit module provides:

- `AlarmKitManager` - Main TypeScript interface
- `ExpoAlarmKitModule` - Native module bridge
- iOS native implementation in Swift
- Expo config plugin for build integration

## Testing

Run linting with `bun run lint` to check code quality.
