# Plan 003: Naming Conventions and API Consistency

## Objective
Rename functions and reorganize the API to match Apple's AlarmManager conventions and prepare for standalone package distribution.

## Learning Focus
- Swift naming conventions
- Expo module API design patterns
- Creating consistent JavaScript interfaces
- Preparing modules for npm distribution

## Current API Issues
1. Inconsistent naming: `scheduleOneOffAsync` vs `getAllScheduledAlarmsAsync`
2. Module named `ExpoAlarmKit` but exports `AlarmKit`
3. No clear separation between manager and individual alarm operations
4. Missing TypeScript documentation

## Target API Design

### Consistent Naming Pattern
Follow Apple's AlarmManager pattern:
- `schedule()` instead of `scheduleOneOffAsync()`
- `getAlarms()` instead of `getAllScheduledAlarmsAsync()`
- `requestAuthorization()` instead of `getAlarmPermissionsAsync()`

### Organized Interface
```typescript
// Main manager interface
export interface AlarmManager {
  // Authorization
  requestAuthorization(): Promise<AlarmPermissionStatus>;
  getAuthorizationStatus(): Promise<AlarmPermissionStatus>;
  
  // Alarm management
  schedule(config: AlarmConfig): Promise<string>;
  getAlarms(): Promise<Alarm[]>;
  cancel(alarmId: string): Promise<void>;
  cancelAll(): Promise<void>;
}

// Individual alarm data
export interface Alarm {
  id: string;
  title: string;
  fireDate?: Date;
  state: AlarmState;
}
```

## Swift Concepts to Understand

### 1. Swift Naming Conventions
```swift
// Swift prefers descriptive, self-documenting names
func scheduleAlarm(withConfiguration config: AlarmConfiguration) // Good
func scheduleOneOffAsync() // Less clear

// Parameter labels make calls readable
schedule(id: alarmId, configuration: config) // Clear intent
```

### 2. Error Handling Patterns
```swift
enum AlarmKitError: Error, LocalizedError {
    case notAuthorized
    case alarmNotFound(String)
    case schedulingFailed
    
    var errorDescription: String? {
        switch self {
        case .notAuthorized:
            return "Alarm authorization not granted"
        case .alarmNotFound(let id):
            return "Alarm with ID \(id) not found"
        case .schedulingFailed:
            return "Failed to schedule alarm"
        }
    }
}
```

### 3. Consistent Return Types
```swift
// Always return the same data structure for alarms
struct SerializedAlarm {
    let id: String
    let title: String
    let fireDate: Double?
    let state: String
}
```

## Implementation Steps

### Step 1: Update TypeScript Definitions
Replace `ExpoAlarmKit.types.ts`:

```typescript
export type AlarmPermissionStatus = 
  | "authorized" 
  | "denied" 
  | "notDetermined" 
  | "unknown";

export type AlarmState = 
  | "scheduled" 
  | "running" 
  | "completed" 
  | "cancelled";

export interface AlarmConfig {
  title: string;
  fireDate: Date;
  stopButtonText?: string;
  stopButtonColor?: string;
}

export interface Alarm {
  id: string;
  title?: string;
  fireDate?: Date;
  state: AlarmState;
}

export interface AlarmManager {
  // Authorization
  requestAuthorization(): Promise<AlarmPermissionStatus>;
  getAuthorizationStatus(): Promise<AlarmPermissionStatus>;
  
  // Alarm management
  schedule(config: AlarmConfig): Promise<string>;
  getAlarms(): Promise<Alarm[]>;
  cancel(alarmId: string): Promise<void>;
  cancelAll(): Promise<void>;
}
```

### Step 2: Rename Swift Functions
Update `ExpoAlarmKitModule.swift`:

```swift
public class ExpoAlarmKitModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAlarmKit")
    Events("onChange")
    
    // Authorization methods
    AsyncFunction("requestAuthorization") { (promise: Promise) in
      // Move existing getAlarmPermissionsAsync logic here
    }
    
    AsyncFunction("getAuthorizationStatus") { (promise: Promise) in
      // Non-requesting version of authorization check
    }
    
    // Alarm management
    AsyncFunction("schedule") { (title: String, fireDate: Double, stopButtonText: String?, stopButtonColor: String?) in
      // Move scheduleAlarmAsync logic here
    }
    
    AsyncFunction("getAlarms") { (promise: Promise) in
      // Move getAllScheduledAlarmsAsync logic here
    }
    
    AsyncFunction("cancel") { (alarmId: String, promise: Promise) in
      // New function to cancel specific alarm
    }
    
    AsyncFunction("cancelAll") { (promise: Promise) in
      // New function to cancel all alarms
    }
  }
}
```

### Step 3: Update JavaScript Interface
Rewrite `ExpoAlarmKitModule.ts`:

```typescript
import AlarmKitNative from "./AlarmKitManager";
import { AlarmConfig, AlarmManager, AlarmPermissionStatus, Alarm } from "./ExpoAlarmKit.types";

class ExpoAlarmManager implements AlarmManager {
  async requestAuthorization(): Promise<AlarmPermissionStatus> {
    return AlarmKitNative.requestAuthorization();
  }
  
  async getAuthorizationStatus(): Promise<AlarmPermissionStatus> {
    return AlarmKitNative.getAuthorizationStatus();
  }
  
  async schedule(config: AlarmConfig): Promise<string> {
    return AlarmKitNative.schedule(
      config.title,
      config.fireDate.getTime() / 1000,
      config.stopButtonText,
      config.stopButtonColor
    );
  }
  
  async getAlarms(): Promise<Alarm[]> {
    const rawAlarms = await AlarmKitNative.getAlarms();
    return rawAlarms.map(alarm => ({
      id: alarm.id,
      title: alarm.title,
      fireDate: alarm.fireDate ? new Date(alarm.fireDate * 1000) : undefined,
      state: alarm.state as AlarmState
    }));
  }
  
  async cancel(alarmId: string): Promise<void> {
    return AlarmKitNative.cancel(alarmId);
  }
  
  async cancelAll(): Promise<void> {
    return AlarmKitNative.cancelAll();
  }
}

// Export singleton instance
export const AlarmManager = new ExpoAlarmManager();

// Default export for compatibility
export default AlarmManager;
```

### Step 4: Add Documentation
Create comprehensive JSDoc comments:

```typescript
/**
 * Requests authorization to schedule alarms.
 * 
 * @returns Promise resolving to authorization status
 * @throws {Error} If the device doesn't support AlarmKit (iOS 26.0+)
 * 
 * @example
 * ```typescript
 * const status = await AlarmManager.requestAuthorization();
 * if (status === 'authorized') {
 *   // Can schedule alarms
 * }
 * ```
 */
async requestAuthorization(): Promise<AlarmPermissionStatus>
```

## Testing

### Step 1: Update App to Use New API
```typescript
import { AlarmManager } from "@/modules/expo-alarm-kit";

// Test authorization
const status = await AlarmManager.requestAuthorization();

// Test scheduling
const alarmId = await AlarmManager.schedule({
  title: "Wake up!",
  fireDate: new Date(Date.now() + 30000)
});

// Test listing
const alarms = await AlarmManager.getAlarms();
console.log("All alarms:", alarms);
```

### Step 2: Verify Backwards Compatibility
Ensure existing code still works by providing legacy exports:

```typescript
// Legacy compatibility
export const AlarmKit = AlarmManager;
export const getAlarmPermissionsAsync = AlarmManager.requestAuthorization;
export const scheduleOneOffAsync = () => AlarmManager.schedule({
  title: "Test Alarm",
  fireDate: new Date(Date.now() + 10000)
});
```

## Package Preparation

### Update package.json in module
```json
{
  "name": "expo-alarm-kit",
  "version": "0.1.0",
  "description": "Expo module for iOS AlarmKit integration",
  "main": "build/index.js",
  "types": "build/index.d.ts",
  "keywords": ["expo", "alarmkit", "ios", "alarms"],
  "repository": "github:username/expo-alarm-kit"
}
```

## Why This Matters
- Professional API design for npm distribution
- Consistent with Apple's naming conventions
- Better TypeScript support and documentation
- Easier to maintain and extend

## Next Steps
Plan 004 will implement the cancel functionality and add more alarm control features.