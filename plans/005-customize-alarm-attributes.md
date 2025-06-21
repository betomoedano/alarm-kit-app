# Plan 005: Customize Alarm Attributes and Presentation

## Objective
Enhance alarm customization with support for different colors, button styles, system images, and alarm presentation options using AlarmKit's full attribute system.

## Learning Focus
- AlarmKit's AlarmAttributes and AlarmPresentation system
- SwiftUI Color and SF Symbols integration
- Swift optionals and default parameter patterns
- Advanced parameter validation and type safety

## AlarmKit Customization Overview
AlarmKit provides rich customization through:
- **AlarmPresentation.Alert**: Title, body text, button customization
- **AlarmAttributes**: Colors, metadata, presentation style
- **Button Configuration**: Text, colors, SF Symbols icons
- **Tint Colors**: Overall alarm theme color

## Swift Concepts to Understand

### 1. AlarmPresentation Structure
```swift
let alert = AlarmPresentation.Alert(
    title: "Wake Up!",                    // Main title
    body: "Time for your morning run",    // Optional subtitle
    stopButton: .init(
        text: "I'm up!",                  // Button text
        textColor: .white,                // Text color
        systemImageName: "sun.max"        // SF Symbol icon
    )
)
```

### 2. Color Handling in SwiftUI
```swift
// System colors
Color.red, Color.blue, Color.accentColor

// Custom colors from hex
Color(red: 0.2, green: 0.6, blue: 0.8)

// Dynamic colors (adapts to light/dark mode)
Color.primary, Color.secondary
```

### 3. SF Symbols Integration
```swift
// Common SF Symbols for alarms
"alarm.fill"        // Alarm clock
"bell.fill"         // Bell
"sun.max"          // Sun
"moon.fill"        // Moon
"xmark"            // X mark
"checkmark"        // Checkmark
```

### 4. Optional Parameter Patterns
```swift
func createAlarm(
    title: String,
    body: String? = nil,           // Optional with default
    buttonText: String = "Stop",   // Required with default
    iconName: String? = nil        // Truly optional
) {
    let finalBody = body ?? "Alarm"
    let finalIcon = iconName ?? "alarm.fill"
}
```

## Implementation Steps

### Step 1: Expand AlarmConfig Interface
Update `ExpoAlarmKit.types.ts`:

```typescript
export interface AlarmConfig {
  // Basic properties
  title: string;
  fireDate: Date;
  
  // Presentation customization
  body?: string;                    // Subtitle text
  tintColor?: string;              // Overall theme color
  
  // Stop button customization
  stopButtonText?: string;         // Button text
  stopButtonTextColor?: string;    // Button text color
  stopButtonIcon?: string;         // SF Symbol name
  stopButtonBackgroundColor?: string; // Button background
}

// Predefined color options for better UX
export type AlarmColor = 
  | "red" | "blue" | "green" | "orange" | "purple" 
  | "pink" | "yellow" | "cyan" | "mint" | "indigo"
  | "accent" | "primary" | "secondary";

export type AlarmIcon = 
  | "alarm.fill" | "bell.fill" | "sun.max" | "moon.fill"
  | "heart.fill" | "star.fill" | "bolt.fill" | "flame.fill"
  | "xmark" | "checkmark" | "stop.fill";
```

### Step 2: Enhanced Color Conversion
Expand `utils.swift` with comprehensive color support:

```swift
import SwiftUI

private func colorFromString(_ colorName: String?) -> Color {
    guard let colorName = colorName?.lowercased() else { return .accentColor }
    
    switch colorName {
    // Basic colors
    case "red": return .red
    case "blue": return .blue
    case "green": return .green
    case "orange": return .orange
    case "purple": return .purple
    case "pink": return .pink
    case "yellow": return .yellow
    
    // Extended palette
    case "cyan": return .cyan
    case "mint": return .mint
    case "indigo": return .indigo
    
    // System colors
    case "primary": return .primary
    case "secondary": return .secondary
    case "accent": return .accentColor
    
    // Custom hex colors (if starts with #)
    case let hex where hex.hasPrefix("#"):
        return colorFromHex(hex)
    
    default: return .accentColor
    }
}

private func colorFromHex(_ hex: String) -> Color {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    
    let a, r, g, b: UInt64
    switch hex.count {
    case 3: // RGB (12-bit)
        (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: // RGB (24-bit)
        (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
    case 8: // ARGB (32-bit)
        (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
    default:
        (a, r, g, b) = (255, 0, 0, 0) // Default to black
    }
    
    return Color(
        .sRGB,
        red: Double(r) / 255,
        green: Double(g) / 255,
        blue: Double(b) / 255,
        opacity: Double(a) / 255
    )
}

private func validateSFSymbol(_ symbolName: String?) -> String {
    guard let symbolName = symbolName else { return "alarm.fill" }
    
    // List of safe, alarm-appropriate SF Symbols
    let validSymbols = [
        "alarm.fill", "bell.fill", "sun.max", "moon.fill",
        "heart.fill", "star.fill", "bolt.fill", "flame.fill",
        "xmark", "checkmark", "stop.fill", "pause.fill",
        "play.fill", "forward.fill", "backward.fill"
    ]
    
    return validSymbols.contains(symbolName) ? symbolName : "alarm.fill"
}
```

### Step 3: Enhanced Schedule Function
Update the schedule function in `utils.swift`:

```swift
@available(iOS 26.0, *)
func scheduleCustomizableAlarm(
    title: String,
    fireDate: Double,
    body: String? = nil,
    tintColor: String? = nil,
    stopButtonText: String? = nil,
    stopButtonTextColor: String? = nil,
    stopButtonIcon: String? = nil,
    stopButtonBackgroundColor: String? = nil
) async throws -> String {
    
    let mgr = AlarmManager.shared
    guard try await mgr.requestAuthorization() == .authorized else { 
        throw NSError(domain: "AlarmKit", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "Alarm authorization not granted"
        ])
    }
    
    // Process parameters with defaults
    let buttonText = stopButtonText ?? "Stop"
    let buttonTextColor = colorFromString(stopButtonTextColor ?? "white")
    let buttonIcon = validateSFSymbol(stopButtonIcon)
    let alarmTintColor = colorFromString(tintColor ?? "accent")
    let date = Date(timeIntervalSince1970: fireDate)
    
    // Create stop button configuration
    let stopButton = AlarmPresentation.Alert.Button(
        text: buttonText,
        textColor: buttonTextColor,
        systemImageName: buttonIcon
    )
    
    // Create alarm presentation
    let alert = AlarmPresentation.Alert(
        title: title,
        body: body, // Can be nil
        stopButton: stopButton
    )
    
    let presentation = AlarmPresentation(alert: alert)
    
    // Create alarm attributes with customization
    let attributes = AlarmAttributes<SimpleMetadata>(
        presentation: presentation,
        tintColor: alarmTintColor
    )
    
    // Create schedule and configuration
    let schedule = Alarm.Schedule.fixed(date)
    let config = AlarmManager.AlarmConfiguration(
        schedule: schedule,
        attributes: attributes
    )
    
    // Schedule the alarm
    let alarmId = UUID()
    try await mgr.schedule(id: alarmId, configuration: config)
    
    return alarmId.uuidString
}
```

### Step 4: Update Swift Module Function
Modify the AsyncFunction in `ExpoAlarmKitModule.swift`:

```swift
AsyncFunction("schedule") { (
    title: String,
    fireDate: Double,
    body: String?,
    tintColor: String?,
    stopButtonText: String?,
    stopButtonTextColor: String?,
    stopButtonIcon: String?,
    stopButtonBackgroundColor: String?,
    promise: Promise
) in
    if #available(iOS 26.0, *) {
        Task {
            do {
                let alarmId = try await scheduleCustomizableAlarm(
                    title: title,
                    fireDate: fireDate,
                    body: body,
                    tintColor: tintColor,
                    stopButtonText: stopButtonText,
                    stopButtonTextColor: stopButtonTextColor,
                    stopButtonIcon: stopButtonIcon,
                    stopButtonBackgroundColor: stopButtonBackgroundColor
                )
                promise.resolve(alarmId)
            } catch {
                promise.reject(error)
            }
        }
    } else {
        promise.reject(UnavailableException())
    }
}
```

### Step 5: Update JavaScript Interface
Modify the schedule function in `ExpoAlarmKitModule.ts`:

```typescript
async schedule(config: AlarmConfig): Promise<string> {
  // Validate required fields
  if (!config.title || !config.fireDate) {
    throw new Error('Title and fireDate are required');
  }
  
  // Validate fireDate is in the future
  if (config.fireDate <= new Date()) {
    throw new Error('Fire date must be in the future');
  }
  
  return AlarmKitNative.schedule(
    config.title,
    config.fireDate.getTime() / 1000, // Convert to seconds
    config.body || null,
    config.tintColor || null,
    config.stopButtonText || null,
    config.stopButtonTextColor || null,
    config.stopButtonIcon || null,
    config.stopButtonBackgroundColor || null
  );
}
```

## Testing

### Step 1: Test Basic Customization
```typescript
// Simple custom alarm
await AlarmManager.schedule({
  title: "Morning Coffee",
  fireDate: new Date(Date.now() + 30000),
  body: "Time for your first cup!",
  tintColor: "orange",
  stopButtonText: "Got it!",
  stopButtonIcon: "sun.max"
});
```

### Step 2: Test Advanced Customization
```typescript
// Highly customized alarm
await AlarmManager.schedule({
  title: "Workout Time",
  fireDate: new Date(Date.now() + 60000),
  body: "Let's get moving!",
  tintColor: "red",
  stopButtonText: "Let's go!",
  stopButtonTextColor: "white",
  stopButtonIcon: "bolt.fill"
});
```

### Step 3: Test Color Validation
```typescript
// Test various color formats
const colorTests = [
  { tintColor: "blue" },           // Named color
  { tintColor: "#FF6B35" },        // Hex color
  { tintColor: "invalidcolor" },   // Should fallback to accent
  { tintColor: "primary" }         // System color
];

for (const test of colorTests) {
  await AlarmManager.schedule({
    title: `Color Test: ${test.tintColor}`,
    fireDate: new Date(Date.now() + (30000 * colorTests.indexOf(test))),
    ...test
  });
}
```

### Step 4: Create Color Picker UI
Add to `app/index.tsx`:

```typescript
const [selectedColor, setSelectedColor] = useState<AlarmColor>("accent");
const [selectedIcon, setSelectedIcon] = useState<AlarmIcon>("alarm.fill");

const colors: AlarmColor[] = ["red", "blue", "green", "orange", "purple"];
const icons: AlarmIcon[] = ["alarm.fill", "bell.fill", "sun.max", "moon.fill", "heart.fill"];

// Color selector
<View style={styles.colorPicker}>
  {colors.map(color => (
    <TouchableOpacity
      key={color}
      onPress={() => setSelectedColor(color)}
      style={[
        styles.colorButton,
        { backgroundColor: color },
        selectedColor === color && styles.selectedColor
      ]}
    />
  ))}
</View>

// Schedule with selections
<Button
  title="Schedule Custom Alarm"
  onPress={() => AlarmManager.schedule({
    title: "Custom Alarm",
    fireDate: new Date(Date.now() + 30000),
    tintColor: selectedColor,
    stopButtonIcon: selectedIcon,
    body: "This is a customized alarm!"
  })}
/>
```

## Why This Matters
- Provides full control over alarm appearance
- Demonstrates advanced AlarmKit capabilities
- Creates professional, customizable user experience
- Shows proper parameter validation and error handling

## Next Steps
Plan 006 will implement state observation to react to alarm lifecycle events and provide real-time updates.