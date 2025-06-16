import ExpoModulesCore
import SwiftUI
import AlarmKit

// Simple metadata type that conforms to AlarmMetadata
struct SimpleMetadata: AlarmMetadata {
    // Empty implementation is fine for basic usage
}

public class ExpoAlarmKitModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoAlarmKit')` in JavaScript.
    Name("ExpoAlarmKit")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }
    
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
          let twoMinsFromNow = Date.now.addingTimeInterval(2 * 60)
          let time = Alarm.Schedule.Relative.Time(
            hour: Calendar.current.component(.hour, from: twoMinsFromNow),
            minute: Calendar.current.component(.minute, from: twoMinsFromNow)
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
