//
//  AlarmExceptions.swift
//
//  Created by beto on 6/17/25.
//

import ExpoModulesCore

internal final class PermissionsNotGranted: Exception {
  override var reason: String {
    "Permissions for alarms are not granted."
  }
}

internal final class UnavailableException: Exception {
  override var reason: String {
    "Alarm is unavailable: AlarmKit requires iOS 26 or higher."
  }
}
