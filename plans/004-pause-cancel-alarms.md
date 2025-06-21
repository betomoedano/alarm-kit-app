# Plan 004: Pause and Cancel Alarm Functionality

## Objective
Implement comprehensive alarm control features including canceling individual alarms, canceling all alarms, and understanding alarm state management.

## Learning Focus
- AlarmKit alarm lifecycle and states
- Swift error handling with async/await
- Working with UUID strings and type conversion
- Array operations and filtering in Swift

## Current AlarmKit States
AlarmKit alarms have these states:
- `scheduled` - Waiting to fire at the scheduled time
- `running` - Currently active/ringing
- `completed` - Fired and was dismissed
- `cancelled` - Was cancelled before firing

## Swift Concepts to Understand

### 1. Alarm Cancellation
```swift
// Cancel specific alarm by ID
try await AlarmManager.shared.cancel(alarmId: UUID(uuidString: idString)!)

// Cancel all alarms
let allAlarms = try AlarmManager.shared.alarms
for alarm in allAlarms {
    try await AlarmManager.shared.cancel(alarmId: alarm.id)
}
```

### 2. UUID Handling
```swift
// Convert string to UUID (can fail)
guard let uuid = UUID(uuidString: idString) else {
    throw AlarmKitError.invalidAlarmId
}

// Safe conversion with error handling
if let uuid = UUID(uuidString: idString) {
    try await AlarmManager.shared.cancel(alarmId: uuid)
} else {
    throw NSError(domain: "AlarmKit", code: 400, userInfo: [
        NSLocalizedDescriptionKey: "Invalid alarm ID format"
    ])
}
```

### 3. Swift Error Handling
```swift
do {
    try await AlarmManager.shared.cancel(alarmId: uuid)
} catch {
    // AlarmKit throws errors for invalid operations
    throw error
}
```

### 4. Array Operations
```swift
// Filter alarms by state
let scheduledAlarms = allAlarms.filter { $0.state == .scheduled }

// Check if alarm exists
let alarmExists = allAlarms.contains { $0.id.uuidString == targetId }
```

## Implementation Steps

### Step 1: Add Cancel Functions to Swift Module
Update `ExpoAlarmKitModule.swift`:

```swift
AsyncFunction("cancel") { (alarmId: String, promise: Promise) in
    if #available(iOS 26.0, *) {
        Task {
            do {
                try await cancelAlarm(alarmId: alarmId)
                promise.resolve(nil)
            } catch {
                promise.reject(error)
            }
        }
    } else {
        promise.reject(UnavailableException())
    }
}

AsyncFunction("cancelAll") { (promise: Promise) in
    if #available(iOS 26.0, *) {
        Task {
            do {
                let cancelledCount = try await cancelAllAlarms()
                promise.resolve(cancelledCount)
            } catch {
                promise.reject(error)
            }
        }
    } else {
        promise.reject(UnavailableException())
    }
}
```

### Step 2: Implement Cancel Functions in utils.swift
Add to `utils.swift`:

```swift
@available(iOS 26.0, *)
func cancelAlarm(alarmId: String) async throws {
    // Convert string ID to UUID
    guard let uuid = UUID(uuidString: alarmId) else {
        throw NSError(domain: "AlarmKit", code: 400, userInfo: [
            NSLocalizedDescriptionKey: "Invalid alarm ID format: \(alarmId)"
        ])
    }
    
    // Get alarm manager
    let manager = AlarmManager.shared
    
    // Check if alarm exists before trying to cancel
    let allAlarms = try manager.alarms
    guard allAlarms.contains(where: { $0.id == uuid }) else {
        throw NSError(domain: "AlarmKit", code: 404, userInfo: [
            NSLocalizedDescriptionKey: "Alarm with ID \(alarmId) not found"
        ])
    }
    
    // Cancel the alarm
    try await manager.cancel(alarmId: uuid)
}

@available(iOS 26.0, *)
func cancelAllAlarms() async throws -> Int {
    let manager = AlarmManager.shared
    let allAlarms = try manager.alarms
    
    // Filter to only scheduled alarms (can't cancel completed ones)
    let cancellableAlarms = allAlarms.filter { alarm in
        alarm.state == .scheduled || alarm.state == .running
    }
    
    // Cancel each alarm
    for alarm in cancellableAlarms {
        do {
            try await manager.cancel(alarmId: alarm.id)
        } catch {
            // Log error but continue with other alarms
            print("Failed to cancel alarm \(alarm.id): \(error)")
        }
    }
    
    return cancellableAlarms.count
}
```

### Step 3: Add Alarm State Querying
Add function to get alarm by ID:

```swift
AsyncFunction("getAlarm") { (alarmId: String, promise: Promise) in
    if #available(iOS 26.0, *) {
        Task {
            do {
                let alarm = try await getAlarmById(alarmId: alarmId)
                promise.resolve(alarm)
            } catch {
                promise.reject(error)
            }
        }
    } else {
        promise.reject(UnavailableException())
    }
}
```

```swift
@available(iOS 26.0, *)
func getAlarmById(alarmId: String) async throws -> [String: Any] {
    guard let uuid = UUID(uuidString: alarmId) else {
        throw NSError(domain: "AlarmKit", code: 400, userInfo: [
            NSLocalizedDescriptionKey: "Invalid alarm ID format"
        ])
    }
    
    let allAlarms = try AlarmManager.shared.alarms
    guard let alarm = allAlarms.first(where: { $0.id == uuid }) else {
        throw NSError(domain: "AlarmKit", code: 404, userInfo: [
            NSLocalizedDescriptionKey: "Alarm not found"
        ])
    }
    
    // Serialize single alarm
    var dict: [String: Any] = [
        "id": alarm.id.uuidString,
        "state": "\(alarm.state)"
    ]
    
    if case .fixed(let date) = alarm.schedule {
        dict["fireDate"] = date.timeIntervalSince1970
    }
    
    return dict
}
```

### Step 4: Update TypeScript Interface
Add to `ExpoAlarmKit.types.ts`:

```typescript
export interface AlarmManager {
  // ... existing methods
  
  /**
   * Cancel a specific alarm by ID
   * @param alarmId - The alarm ID to cancel
   * @throws {Error} If alarm not found or invalid ID
   */
  cancel(alarmId: string): Promise<void>;
  
  /**
   * Cancel all scheduled alarms
   * @returns Number of alarms that were cancelled
   */
  cancelAll(): Promise<number>;
  
  /**
   * Get details for a specific alarm
   * @param alarmId - The alarm ID to lookup
   * @returns Alarm details or throws if not found
   */
  getAlarm(alarmId: string): Promise<Alarm>;
}
```

### Step 5: Update JavaScript Implementation
Add to `ExpoAlarmKitModule.ts`:

```typescript
async cancel(alarmId: string): Promise<void> {
  if (!alarmId || typeof alarmId !== 'string') {
    throw new Error('Alarm ID must be a non-empty string');
  }
  
  return AlarmKitNative.cancel(alarmId);
}

async cancelAll(): Promise<number> {
  return AlarmKitNative.cancelAll();
}

async getAlarm(alarmId: string): Promise<Alarm> {
  if (!alarmId || typeof alarmId !== 'string') {
    throw new Error('Alarm ID must be a non-empty string');
  }
  
  const rawAlarm = await AlarmKitNative.getAlarm(alarmId);
  return {
    id: rawAlarm.id,
    title: rawAlarm.title,
    fireDate: rawAlarm.fireDate ? new Date(rawAlarm.fireDate * 1000) : undefined,
    state: rawAlarm.state as AlarmState
  };
}
```

## Testing

### Step 1: Test Individual Cancel
```typescript
// Schedule an alarm
const alarmId = await AlarmManager.schedule({
  title: "Test Alarm",
  fireDate: new Date(Date.now() + 60000) // 1 minute
});

// Cancel it
await AlarmManager.cancel(alarmId);

// Verify it's gone
const alarms = await AlarmManager.getAlarms();
const foundAlarm = alarms.find(a => a.id === alarmId);
console.log("Alarm should be cancelled:", foundAlarm?.state);
```

### Step 2: Test Cancel All
```typescript
// Schedule multiple alarms
const ids = await Promise.all([
  AlarmManager.schedule({ title: "Alarm 1", fireDate: new Date(Date.now() + 30000) }),
  AlarmManager.schedule({ title: "Alarm 2", fireDate: new Date(Date.now() + 60000) }),
  AlarmManager.schedule({ title: "Alarm 3", fireDate: new Date(Date.now() + 90000) })
]);

// Cancel all
const cancelledCount = await AlarmManager.cancelAll();
console.log(`Cancelled ${cancelledCount} alarms`);

// Verify they're gone
const remainingAlarms = await AlarmManager.getAlarms();
console.log("Remaining scheduled alarms:", remainingAlarms.filter(a => a.state === 'scheduled'));
```

### Step 3: Test Error Handling
```typescript
try {
  await AlarmManager.cancel("invalid-id");
} catch (error) {
  console.log("Expected error for invalid ID:", error.message);
}

try {
  await AlarmManager.cancel("550e8400-e29b-41d4-a716-446655440000"); // Valid format but doesn't exist
} catch (error) {
  console.log("Expected error for non-existent alarm:", error.message);
}
```

### Step 4: Update App UI
Add cancel controls to `app/index.tsx`:

```typescript
const [alarms, setAlarms] = useState<Alarm[]>([]);

// Function to refresh alarm list
const refreshAlarms = async () => {
  const currentAlarms = await AlarmManager.getAlarms();
  setAlarms(currentAlarms);
};

// Render alarm list with cancel buttons
{alarms.map(alarm => (
  <View key={alarm.id} style={styles.alarmItem}>
    <Text>{alarm.title} - {alarm.state}</Text>
    <Button 
      title="Cancel"
      onPress={() => handleCancelAlarm(alarm.id)}
    />
  </View>
))}

const handleCancelAlarm = async (alarmId: string) => {
  try {
    await AlarmManager.cancel(alarmId);
    await refreshAlarms(); // Refresh the list
    alert('Alarm cancelled');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

## Why This Matters
- Essential functionality for any alarm app
- Demonstrates proper error handling patterns
- Shows how to work with AlarmKit state management
- Foundation for more advanced alarm controls

## Next Steps
Plan 005 will focus on customizing alarm attributes like colors, sounds, and presentation styles.