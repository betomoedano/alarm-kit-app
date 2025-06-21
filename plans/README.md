# Development Plans for Expo AlarmKit Module

This folder contains step-by-step development plans for building a comprehensive AlarmKit module for Expo. Each plan focuses on small, incremental improvements to help learn Swift and iOS development while building towards a production-ready module.

## Learning Goals
- Understanding Swift syntax and iOS development
- Learning Apple's AlarmKit framework
- Building robust Expo native modules
- Preparing module for standalone package distribution

## Plan Structure
Each plan includes:
- **Objective**: What we're building
- **Learning Focus**: Key concepts to understand
- **Implementation Steps**: Detailed coding instructions
- **Swift Explanations**: Non-obvious Swift concepts explained
- **Testing**: How to verify the implementation works

## Development Roadmap

### Phase 1: Core Functionality
- [Plan 001](./001-fix-scheduled-alarms-list.md) - Fix getAllScheduledAlarmsAsync bug
- [Plan 002](./002-add-js-parameters.md) - Add JavaScript parameters for alarm scheduling
- [Plan 003](./003-naming-conventions.md) - Rename to match AlarmManager conventions

### Phase 2: Advanced Control
- [Plan 004](./004-pause-cancel-alarms.md) - Add pause/cancel alarm functionality
- [Plan 005](./005-customize-alarm-attributes.md) - Customize alarm attributes and presentation

### Phase 3: State Management
- [Plan 006](./006-observe-state-changes.md) - Observe and react to alarm state changes

## Module Architecture Overview

```
expo-alarm-kit/
├── src/                          # TypeScript interface
│   ├── AlarmKitManager.ts       # Native module bridge
│   ├── ExpoAlarmKitModule.ts    # Main JS exports
│   └── ExpoAlarmKit.types.ts    # Type definitions
├── ios/                         # Swift implementation
│   ├── ExpoAlarmKitModule.swift # Main module definition
│   ├── utils.swift              # Alarm utility functions
│   └── Helpers.swift            # Helper functions
└── plugin/                      # Expo config plugin
    └── withAlarmKit.ts
```

## Next Steps
Start with Plan 001 to fix the critical bug, then proceed through the plans sequentially.