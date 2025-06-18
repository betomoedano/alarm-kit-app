import ExpoModulesCore
import SwiftUI
import AlarmKit

// Simple metadata type that conforms to AlarmMetadata
struct SimpleMetadata: AlarmMetadata {
    // Empty implementation is fine for basic usage
}

public class ExpoAlarmKitModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAlarmKit")
    
    // Defines event names that the module can send to JavaScript.
    Events("onChange")
    
    AsyncFunction("getAllScheduledAlarmsAsync") { (promise: Promise) in
      if #available(iOS 26.0, *) {
        Task {
          do {
            let alarms = try await getAllScheduledAlarms()
            promise.resolve(alarms)
          } catch {
            promise.reject(error)
          }
        }
      } else {
        promise.reject(UnavailableException())
      }
    }
   
    AsyncFunction("getAlarmPermissionsAsync") { (promise: Promise) in
      guard #available(iOS 26.0, macOS 26.0, *) else {
        promise.reject(UnavailableException())
        return
      }

      Task {
        let alarmManager = AlarmManager.shared
        var state = alarmManager.authorizationState

        if state == .notDetermined {
          state = (try? await alarmManager.requestAuthorization()) ?? .notDetermined
        }

        let status: String
        switch state {
        case .authorized:
          status = "authorized"
        case .denied:
          status = "denied"
        case .notDetermined:
          status = "notDetermined"
        @unknown default:
          status = "unknown"
        }

        promise.resolve(status)
      }
    }
    
    AsyncFunction("scheduleOneOffAsync") { (promise: Promise) in
      if #available(iOS 26.0, *) {
        Task {
          do   { try await scheduleOneOffAlarm(); promise.resolve(nil) }
          catch { promise.reject(error) }
        }
      } else {
        promise.reject(UnavailableException())
      }
    }
    
    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }
    
  }
}

