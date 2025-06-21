# Plan 001: Fix getAllScheduledAlarmsAsync Bug

## Objective
Fix the critical bug in `getAllScheduledAlarmsAsync` where the Swift code returns raw `Alarm` objects instead of serialized JavaScript-compatible data.

## Learning Focus
- Understanding Swift-to-JavaScript data serialization
- Working with Swift dictionaries and type conversion
- Promise resolution in Expo modules
- Debugging native module issues

## Current Problem
In `ExpoAlarmKitModule.swift:40`, the code resolves with `alarms` (raw Alarm objects) instead of `serialized` (JavaScript-compatible dictionaries):

```swift
promise.resolve(alarms) // ❌ This breaks JS bridge
```

Should be:
```swift
promise.resolve(serialized) // ✅ JavaScript can handle this
```

## Swift Concepts to Understand

### 1. Type Conversion
- Swift `Alarm` objects can't be directly passed to JavaScript
- Need to convert to basic types: `String`, `Double`, `[String: Any]`
- Dictionaries (`[String: Any]`) become JavaScript objects

### 2. Enum Pattern Matching
```swift
if case .fixed(let date) = alarm.schedule {
    // This extracts the date from a .fixed enum case
    // AlarmKit uses enums to represent different schedule types
}
```

### 3. String Interpolation
```swift
"\(alarm.state)" // Converts enum to string representation
```

## Implementation Steps

### Step 1: Locate the Bug
Open `modules/expo-alarm-kit/ios/ExpoAlarmKitModule.swift` and find line 40.

### Step 2: Fix the Resolution
Change:
```swift
promise.resolve(alarms)
```

To:
```swift
promise.resolve(serialized)
```

### Step 3: Understand the Serialization Logic
The code already creates a `serialized` array that converts each `Alarm` to a dictionary:

```swift
let serialized: [[String: Any]] = alarms.map { alarm in
    var dict: [String: Any] = [
        "id": alarm.id.uuidString,        // UUID as string
        "state": "\(alarm.state)"         // Enum as string
    ]
    
    // Extract fire date if it's a fixed alarm
    if case .fixed(let date) = alarm.schedule {
        dict["fireDate"] = date.timeIntervalSince1970  // Date as timestamp
    }
    
    return dict
}
```

## Testing

### Step 1: Build and Run
```bash
bun run ios
```

### Step 2: Test the Function
1. Schedule an alarm using "Schedule One Off Alarm" button
2. Tap "Get All Scheduled Alarms" button
3. Check console output - should see alarm data instead of error

### Step 3: Expected Output
Console should show something like:
```javascript
>>> alarms [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    state: "scheduled",
    fireDate: 1671234567.89
  }
]
```

## Why This Matters
- This fix enables the core "list alarms" functionality
- Sets up proper data flow between Swift and JavaScript
- Foundation for all future alarm management features

## Next Steps
After this fix works, we'll move to Plan 002 to add JavaScript parameters for customizing alarms.