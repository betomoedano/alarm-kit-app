# Plan 006: Observe Alarm State Changes

## Objective
Implement real-time observation of alarm state changes using AlarmKit's observation capabilities and Expo module events to provide live updates to the JavaScript layer.

## Learning Focus
- Swift Combine framework for reactive programming
- AlarmKit observation patterns
- Expo module event system
- Managing subscriptions and memory in Swift
- JavaScript event listeners and cleanup

## AlarmKit Observation Overview
AlarmKit provides observation through:
- `AlarmManager.shared.alarms` - Current alarm list (observable)
- Alarm state changes: `scheduled` → `running` → `completed`/`cancelled`
- Real-time updates when alarms fire, get cancelled, or complete

## Swift Concepts to Understand

### 1. Combine Framework
```swift
import Combine

// Publisher that emits alarm updates
let alarmPublisher = AlarmManager.shared.$alarms
    .sink { alarms in
        // Handle alarm list changes
        self.handleAlarmChanges(alarms)
    }
```

### 2. Observation Storage
```swift
private var cancellables = Set<AnyCancellable>()

// Store subscription to prevent deallocation
alarmPublisher.store(in: &cancellables)
```

### 3. Event Broadcasting
```swift
// Send events to JavaScript
self.sendEvent("alarmStateChanged", [
    "alarmId": alarm.id.uuidString,
    "newState": "\(alarm.state)",
    "timestamp": Date().timeIntervalSince1970
])
```

### 4. Weak References
```swift
// Prevent retain cycles
alarmPublisher
    .sink { [weak self] alarms in
        self?.handleAlarmChanges(alarms)
    }
    .store(in: &cancellables)
```

## Implementation Steps

### Step 1: Add Observation Support to Swift Module
Update `ExpoAlarmKitModule.swift`:

```swift
import Combine

public class ExpoAlarmKitModule: Module {
    // Store alarm observation subscriptions
    private var alarmObserver: AnyCancellable?
    private var isObserving = false
    private var lastKnownAlarms: [Alarm] = []
    
    public func definition() -> ModuleDefinition {
        Name("ExpoAlarmKit")
        
        // Define events that can be sent to JavaScript
        Events("alarmStateChanged", "alarmListChanged", "alarmFired")
        
        // ... existing functions ...
        
        // Start observing alarm changes
        AsyncFunction("startObserving") { (promise: Promise) in
            if #available(iOS 26.0, *) {
                self.startAlarmObservation()
                promise.resolve(true)
            } else {
                promise.reject(UnavailableException())
            }
        }
        
        // Stop observing alarm changes
        AsyncFunction("stopObserving") { (promise: Promise) in
            self.stopAlarmObservation()
            promise.resolve(true)
        }
        
        // Get current observation status
        Function("isObserving") {
            return self.isObserving
        }
    }
    
    @available(iOS 26.0, *)
    private func startAlarmObservation() {
        guard !isObserving else { return }
        
        isObserving = true
        
        // Observe alarm list changes
        alarmObserver = AlarmManager.shared.$alarms
            .sink { [weak self] alarms in
                self?.handleAlarmListChanged(alarms)
            }
    }
    
    private func stopAlarmObservation() {
        alarmObserver?.cancel()
        alarmObserver = nil
        isObserving = false
        lastKnownAlarms = []
    }
    
    @available(iOS 26.0, *)
    private func handleAlarmListChanged(_ currentAlarms: [Alarm]) {
        // Compare with previous state to detect changes
        let previousAlarms = lastKnownAlarms
        lastKnownAlarms = currentAlarms
        
        // Send overall list change event
        sendEvent("alarmListChanged", [
            "totalCount": currentAlarms.count,
            "scheduledCount": currentAlarms.filter { $0.state == .scheduled }.count,
            "timestamp": Date().timeIntervalSince1970
        ])
        
        // Detect individual alarm state changes
        detectStateChanges(previous: previousAlarms, current: currentAlarms)
    }
    
    @available(iOS 26.0, *)
    private func detectStateChanges(previous: [Alarm], current: [Alarm]) {
        // Create lookups for efficient comparison
        let previousDict = Dictionary(uniqueKeysWithValues: previous.map { ($0.id, $0) })
        let currentDict = Dictionary(uniqueKeysWithValues: current.map { ($0.id, $0) })
        
        // Check for state changes in existing alarms
        for (id, currentAlarm) in currentDict {
            if let previousAlarm = previousDict[id] {
                if previousAlarm.state != currentAlarm.state {
                    // Alarm state changed
                    sendAlarmStateChangedEvent(
                        alarm: currentAlarm,
                        previousState: "\(previousAlarm.state)",
                        newState: "\(currentAlarm.state)"
                    )
                }
            } else {
                // New alarm added
                sendEvent("alarmAdded", serializeAlarm(currentAlarm))
            }
        }
        
        // Check for removed alarms
        for (id, previousAlarm) in previousDict {
            if currentDict[id] == nil {
                sendEvent("alarmRemoved", [
                    "id": id.uuidString,
                    "lastState": "\(previousAlarm.state)"
                ])
            }
        }
    }
    
    private func sendAlarmStateChangedEvent(alarm: Alarm, previousState: String, newState: String) {
        var eventData = serializeAlarm(alarm)
        eventData["previousState"] = previousState
        eventData["newState"] = newState
        eventData["timestamp"] = Date().timeIntervalSince1970
        
        sendEvent("alarmStateChanged", eventData)
        
        // Send specific events for important state changes
        if newState == "running" {
            sendEvent("alarmFired", eventData)
        }
    }
    
    @available(iOS 26.0, *)
    private func serializeAlarm(_ alarm: Alarm) -> [String: Any] {
        var dict: [String: Any] = [
            "id": alarm.id.uuidString,
            "state": "\(alarm.state)"
        ]
        
        if case .fixed(let date) = alarm.schedule {
            dict["fireDate"] = date.timeIntervalSince1970
        }
        
        return dict
    }
    
    // Clean up when module is deallocated
    deinit {
        stopAlarmObservation()
    }
}
```

### Step 2: Add Event Types to TypeScript
Update `ExpoAlarmKit.types.ts`:

```typescript
// Event payloads
export interface AlarmStateChangedEvent {
  id: string;
  previousState: AlarmState;
  newState: AlarmState;
  fireDate?: number;
  timestamp: number;
}

export interface AlarmListChangedEvent {
  totalCount: number;
  scheduledCount: number;
  timestamp: number;
}

export interface AlarmAddedEvent {
  id: string;
  state: AlarmState;
  fireDate?: number;
}

export interface AlarmRemovedEvent {
  id: string;
  lastState: AlarmState;
}

export interface AlarmFiredEvent {
  id: string;
  state: AlarmState;
  fireDate?: number;
  timestamp: number;
}

// Event listener types
export type AlarmEventListener<T> = (event: T) => void;

// Update module events
export type ExpoAlarmKitModuleEvents = {
  alarmStateChanged: AlarmStateChangedEvent;
  alarmListChanged: AlarmListChangedEvent;
  alarmAdded: AlarmAddedEvent;
  alarmRemoved: AlarmRemovedEvent;
  alarmFired: AlarmFiredEvent;
};
```

### Step 3: Add Event Management to JavaScript Interface
Update `ExpoAlarmKitModule.ts`:

```typescript
import { EventSubscription } from 'expo';

class ExpoAlarmManager implements AlarmManager {
  private observing = false;
  
  // ... existing methods ...
  
  /**
   * Start observing alarm state changes
   * @returns Promise that resolves when observation starts
   */
  async startObserving(): Promise<void> {
    if (this.observing) return;
    
    await AlarmKitNative.startObserving();
    this.observing = true;
  }
  
  /**
   * Stop observing alarm state changes
   * @returns Promise that resolves when observation stops
   */
  async stopObserving(): Promise<void> {
    if (!this.observing) return;
    
    await AlarmKitNative.stopObserving();
    this.observing = false;
  }
  
  /**
   * Check if currently observing alarm changes
   */
  isObserving(): boolean {
    return AlarmKitNative.isObserving();
  }
  
  // Event listener management
  onAlarmStateChanged(listener: AlarmEventListener<AlarmStateChangedEvent>): EventSubscription {
    return AlarmKitNative.addListener('alarmStateChanged', listener);
  }
  
  onAlarmListChanged(listener: AlarmEventListener<AlarmListChangedEvent>): EventSubscription {
    return AlarmKitNative.addListener('alarmListChanged', listener);
  }
  
  onAlarmFired(listener: AlarmEventListener<AlarmFiredEvent>): EventSubscription {
    return AlarmKitNative.addListener('alarmFired', listener);
  }
  
  onAlarmAdded(listener: AlarmEventListener<AlarmAddedEvent>): EventSubscription {
    return AlarmKitNative.addListener('alarmAdded', listener);
  }
  
  onAlarmRemoved(listener: AlarmEventListener<AlarmRemovedEvent>): EventSubscription {
    return AlarmKitNative.addListener('alarmRemoved', listener);
  }
}
```

### Step 4: Create React Hook for Alarm Observation
Create `hooks/useAlarmObserver.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { EventSubscription } from 'expo';
import { AlarmManager, Alarm, AlarmStateChangedEvent, AlarmListChangedEvent } from '@/modules/expo-alarm-kit';

export function useAlarmObserver() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isObserving, setIsObserving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Refresh alarm list
  const refreshAlarms = useCallback(async () => {
    try {
      const currentAlarms = await AlarmManager.getAlarms();
      setAlarms(currentAlarms);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh alarms:', error);
    }
  }, []);
  
  // Start observation
  const startObserving = useCallback(async () => {
    try {
      await AlarmManager.startObserving();
      setIsObserving(true);
      await refreshAlarms();
    } catch (error) {
      console.error('Failed to start observing:', error);
    }
  }, [refreshAlarms]);
  
  // Stop observation
  const stopObserving = useCallback(async () => {
    try {
      await AlarmManager.stopObserving();
      setIsObserving(false);
    } catch (error) {
      console.error('Failed to stop observing:', error);
    }
  }, []);
  
  useEffect(() => {
    let subscriptions: EventSubscription[] = [];
    
    if (isObserving) {
      // Listen for alarm state changes
      subscriptions.push(
        AlarmManager.onAlarmStateChanged((event: AlarmStateChangedEvent) => {
          console.log(`Alarm ${event.id} changed from ${event.previousState} to ${event.newState}`);
          refreshAlarms();
        })
      );
      
      // Listen for list changes
      subscriptions.push(
        AlarmManager.onAlarmListChanged((event: AlarmListChangedEvent) => {
          console.log(`Alarm list changed: ${event.totalCount} total, ${event.scheduledCount} scheduled`);
          refreshAlarms();
        })
      );
      
      // Listen for alarms firing
      subscriptions.push(
        AlarmManager.onAlarmFired((event) => {
          console.log(`Alarm fired: ${event.id}`);
          // Could trigger UI notifications, sounds, etc.
        })
      );
    }
    
    return () => {
      subscriptions.forEach(sub => sub.remove());
    };
  }, [isObserving, refreshAlarms]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isObserving) {
        AlarmManager.stopObserving();
      }
    };
  }, [isObserving]);
  
  return {
    alarms,
    isObserving,
    lastUpdate,
    startObserving,
    stopObserving,
    refreshAlarms
  };
}
```

## Testing

### Step 1: Update App to Use Observer Hook
Update `app/index.tsx`:

```typescript
import { useAlarmObserver } from '@/hooks/useAlarmObserver';

export default function Index() {
  const { 
    alarms, 
    isObserving, 
    lastUpdate, 
    startObserving, 
    stopObserving 
  } = useAlarmObserver();
  
  // Start observing when component mounts
  useEffect(() => {
    startObserving();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text>Observer Status: {isObserving ? 'Active' : 'Inactive'}</Text>
      {lastUpdate && <Text>Last Update: {lastUpdate.toLocaleTimeString()}</Text>}
      
      <View style={styles.controls}>
        <Button 
          title={isObserving ? "Stop Observing" : "Start Observing"}
          onPress={isObserving ? stopObserving : startObserving}
        />
      </View>
      
      <ScrollView style={styles.alarmList}>
        {alarms.map(alarm => (
          <View key={alarm.id} style={styles.alarmItem}>
            <Text>{alarm.title || 'Alarm'}</Text>
            <Text>State: {alarm.state}</Text>
            {alarm.fireDate && (
              <Text>Fires: {alarm.fireDate.toLocaleString()}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

### Step 2: Test Real-time Updates
1. Start the app and enable observation
2. Schedule multiple alarms with short delays (30 seconds, 1 minute)
3. Watch the UI update in real-time as alarms change state
4. Cancel an alarm and verify immediate UI update
5. Let an alarm fire and observe the state change

### Step 3: Test Performance
```typescript
// Stress test with many alarms
const stressTest = async () => {
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      AlarmManager.schedule({
        title: `Test Alarm ${i}`,
        fireDate: new Date(Date.now() + (i * 10000)) // Every 10 seconds
      })
    );
  }
  await Promise.all(promises);
  console.log('Scheduled 10 alarms for stress testing');
};
```

## Why This Matters
- Provides real-time user experience
- Essential for alarm management apps
- Demonstrates advanced reactive programming patterns
- Shows proper resource management and cleanup
- Foundation for notifications and background updates

## Module Completion
After implementing Plan 006, you'll have a comprehensive AlarmKit module with:
- ✅ Full alarm lifecycle management
- ✅ Rich customization options
- ✅ Real-time state observation
- ✅ Professional API design
- ✅ Proper error handling
- ✅ TypeScript support
- ✅ Ready for npm distribution

The module will be production-ready and suitable for packaging as a standalone Expo module!