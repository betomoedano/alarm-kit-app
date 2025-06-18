//
//  utils.swift
//  ExpoAlarmKit
//
//  Created by beto on 6/18/25.
//

import AlarmKit

@available(iOS 26.0, *)
func scheduleOneOffAlarm() async throws {
  // 1. Authorisation
  let mgr = AlarmManager.shared
  guard try await mgr.requestAuthorization() == .authorized else { return }
  
  // 2. Alarm presentation (basic stop button, default sound)
  let alert = AlarmPresentation.Alert(
    title: "Expo test alarm",
    stopButton: .init(text: "Stop", textColor: .white, systemImageName: "xmark"),
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

@available(iOS 26.0, *)
func getAllScheduledAlarms() async throws -> [Alarm] {
  let alarms = try! AlarmManager.shared.alarms
  print(">>> native alarms: \(alarms)")
  return alarms
}
