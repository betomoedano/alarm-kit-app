import ExpoModulesCore
import SwiftUI
import AlarmKit

// Simple metadata type that conforms to AlarmMetadata
struct SimpleMetadata: AlarmMetadata {
    // Empty implementation is fine for basic usage
}

@available(iOS 26.0, *)
func scheduleOneOffAlarm() async throws {
  // 1. Authorisation
  let mgr = AlarmManager.shared
  guard try await mgr.requestAuthorization() == .authorized else { return }

  // 2. Alarm presentation (basic stop button, default sound)
  let alert = AlarmPresentation.Alert(
    title: "Expo test alarm",
    stopButton: .init(text: "Stop", textColor: .white, systemImageName: "xmark"),
    secondaryButton: AlarmButton(text: "Repeat", textColor: .blue, systemImageName: "repeat"),
    secondaryButtonBehavior: .countdown
  )
  
  let presentation = AlarmPresentation(alert: alert)
 
  // 3. Attributes & configuration
  let attrs = AlarmAttributes<SimpleMetadata>(presentation: presentation,
                                              tintColor: .accentColor)
  let fireDate = Date().addingTimeInterval(10)
  let schedule = Alarm.Schedule.fixed(fireDate)

  let config = AlarmManager.AlarmConfiguration(schedule: schedule,
                                               attributes: attrs)

  // 4. Schedule
  let _ = try await mgr.schedule(id: UUID(), configuration: config)
}

public class ExpoAlarmKitModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAlarmKit")
    
    // Defines event names that the module can send to JavaScript.
    Events("onChange")
    
    Function("schedule") {
      if #available(iOS 26.0, macOS 26.0, *) {
        Task {
          let alarmManager = AlarmManager.shared
          
          let authorized: Bool
          switch alarmManager.authorizationState {
          case .notDetermined:
            authorized = (try? await alarmManager.requestAuthorization()) == .authorized
          case .authorized:
            authorized = true
          case .denied:
            authorized = false
          @unknown default:
            authorized = false
          }
          
          guard authorized else {
            print(">>> AlarmKit not authorized.")
            return
          }
          
          let id = UUID()
          
          // Create a simple alert
          let alert = AlarmPresentation.Alert(
            title: "Simple Alarm",
            stopButton: .init(text: "Stop", textColor: .blue, systemImageName: "xmark")
          )
          
          // Create the presentation with just the alert
          let presentation = AlarmPresentation(alert: alert)
          
          // Create attributes with our SimpleMetadata
          let attributes = AlarmAttributes<SimpleMetadata>(
            presentation: presentation,
            tintColor: Color.accentColor
          )
          
          // Create a schedule for 2 minutes from now
          let minsFromNow = Date.now.addingTimeInterval(1 * 60)
          let time = Alarm.Schedule.Relative.Time(
            hour: Calendar.current.component(.hour, from: minsFromNow),
            minute: Calendar.current.component(.minute, from: minsFromNow)
          )
          let schedule = Alarm.Schedule.relative(.init(time: time))
          
          // Create the alarm configuration
          let configuration = AlarmManager.AlarmConfiguration<SimpleMetadata>(
            schedule: schedule,
            attributes: attributes
          )
          
          do {
            // Schedule the alarm
            let alarm = try await alarmManager.schedule(id: id, configuration: configuration)
            print(">>> Alarm scheduled successfully: \(alarm.id)")
          } catch {
            print(">>> Error scheduling alarm: \(error)")
          }
        }
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

