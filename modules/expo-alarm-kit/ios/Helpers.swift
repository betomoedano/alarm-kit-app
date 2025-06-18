//
//  Helpers.swift
//  ExpoAlarmKit
//
//  Created by beto on 6/18/25.
//

import AlarmKit

@available(iOS 26.0, *)
private func string(for state: AlarmManager.AuthorizationState) -> String {
  switch state {
  case .authorized:      "authorized"
  case .denied:          "denied"
  case .notDetermined:   "notDetermined"
  @unknown default:      "unknown"
  }
}
