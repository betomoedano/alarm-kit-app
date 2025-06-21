# Plan 002: Add JavaScript Parameters for Alarm Scheduling

## Objective
Replace the hardcoded dummy alarm with a configurable function that accepts title, date, and other parameters from JavaScript.

## Learning Focus
- Passing parameters from JavaScript to Swift
- Swift function parameters and default values
- Date handling between JavaScript and Swift
- Optional parameters in Expo modules

## Current State
The `scheduleOneOffAsync` function is hardcoded:
- Title: "Expo test alarm"
- Fire date: 10 seconds from now
- Button text: "Stop"

## Target Implementation

### JavaScript Interface
```typescript
interface AlarmConfig {
  title: string;
  fireDate: Date;
  stopButtonText?: string;
  stopButtonColor?: string;
}

async function scheduleAlarmAsync(config: AlarmConfig): Promise<string> {
  // Returns alarm ID
}
```

### Usage Example
```typescript
const alarmId = await AlarmKit.scheduleAlarmAsync({
  title: "Morning Workout",
  fireDate: new Date(2024, 0, 15, 6, 30), // Jan 15, 6:30 AM
  stopButtonText: "I'm up!",
  stopButtonColor: "blue"
});
```

## Swift Concepts to Understand

### 1. Function Parameters
```swift
AsyncFunction("scheduleAlarmAsync") { (title: String, fireDate: Double, stopButtonText: String?) in
    // title: required string
    // fireDate: timestamp from JavaScript Date
    // stopButtonText: optional string (nil if not provided)
}
```

### 2. Optional Parameters
```swift
let buttonText = stopButtonText ?? "Stop"  // Use "Stop" if nil
```

### 3. Date Conversion
```swift
let date = Date(timeIntervalSince1970: fireDate)  // Convert JS timestamp to Swift Date
```

### 4. Color Handling
```swift
import SwiftUI

let color: Color = switch colorName {
    case "red": .red
    case "blue": .blue
    case "green": .green
    default: .accentColor
}
```

## Implementation Steps

### Step 1: Update TypeScript Types
Add to `ExpoAlarmKit.types.ts`:

```typescript
export interface AlarmConfig {
  title: string;
  fireDate: Date;
  stopButtonText?: string;
  stopButtonColor?: string;
}

export declare class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  // ... existing methods
  scheduleAlarmAsync(config: AlarmConfig): Promise<string>;
}
```

### Step 2: Update JavaScript Interface
Modify `ExpoAlarmKitModule.ts`:

```typescript
async function scheduleAlarmAsync(config: AlarmConfig): Promise<string> {
  return AlarmKitManager.scheduleAlarmAsync(
    config.title,
    config.fireDate.getTime() / 1000, // Convert to seconds
    config.stopButtonText,
    config.stopButtonColor
  );
}
```

### Step 3: Update Swift Implementation
Replace the current `scheduleOneOffAsync` in `ExpoAlarmKitModule.swift`:

```swift
AsyncFunction("scheduleAlarmAsync") { (title: String, fireDate: Double, stopButtonText: String?, stopButtonColor: String?) in
    // Implementation details in next step
}
```

### Step 4: Create Configurable Swift Function
Add to `utils.swift`:

```swift
@available(iOS 26.0, *)
func scheduleConfigurableAlarm(
    title: String,
    fireDate: Double,
    stopButtonText: String? = nil,
    stopButtonColor: String? = nil
) async throws -> String {
    
    let mgr = AlarmManager.shared
    guard try await mgr.requestAuthorization() == .authorized else { 
        throw NSError(domain: "AlarmKit", code: 1, userInfo: [NSLocalizedDescriptionKey: "Not authorized"])
    }
    
    // Convert parameters
    let buttonText = stopButtonText ?? "Stop"
    let date = Date(timeIntervalSince1970: fireDate)
    let color = colorFromString(stopButtonColor ?? "accent")
    
    // Create alarm presentation
    let alert = AlarmPresentation.Alert(
        title: title,
        stopButton: .init(text: buttonText, textColor: .white, systemImageName: "xmark")
    )
    
    let presentation = AlarmPresentation(alert: alert)
    let attrs = AlarmAttributes<SimpleMetadata>(presentation: presentation, tintColor: color)
    let schedule = Alarm.Schedule.fixed(date)
    let config = AlarmManager.AlarmConfiguration(schedule: schedule, attributes: attrs)
    
    // Schedule and return ID
    let alarmId = UUID()
    let _ = try await mgr.schedule(id: alarmId, configuration: config)
    return alarmId.uuidString
}

// Helper function for color conversion
private func colorFromString(_ colorName: String) -> Color {
    switch colorName.lowercased() {
    case "red": return .red
    case "blue": return .blue
    case "green": return .green
    case "orange": return .orange
    case "purple": return .purple
    default: return .accentColor
    }
}
```

## Testing

### Step 1: Update App Interface
Modify `app/index.tsx` to test new parameters:

```typescript
<Button
  title="Schedule Custom Alarm"
  onPress={async () => {
    try {
      const alarmId = await ExpoAlarmKit.scheduleAlarmAsync({
        title: "Custom Test Alarm",
        fireDate: new Date(Date.now() + 15000), // 15 seconds from now
        stopButtonText: "I'm awake!",
        stopButtonColor: "blue"
      });
      alert(`Alarm scheduled with ID: ${alarmId}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }}
/>
```

### Step 2: Test Different Configurations
Try various combinations:
- Different titles
- Different dates (near future for testing)
- Different button texts and colors

## Why This Matters
- Makes the module actually useful for real applications
- Demonstrates proper parameter passing in Expo modules
- Sets foundation for more advanced customization

## Next Steps
Plan 003 will focus on renaming functions to match AlarmManager conventions and improving the overall API design.