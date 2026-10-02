package com.igng.tokenmonitor.android.ui.components

import com.igng.tokenmonitor.android.data.model.DeviceDto

data class KeyedDevice(val device: DeviceDto, val key: String)

/**
 * Lazy lists need keys that are both non-empty and unique.  The Hub normally
 * supplies a stable device id, but old or malformed snapshots can omit it or
 * contain duplicates.  The occurrence suffix keeps those rows renderable without
 * changing the id used for network requests.
 */
fun keyedDevices(devices: List<DeviceDto>): List<KeyedDevice> {
  val occurrences = mutableMapOf<String, Int>()
  return devices.mapIndexed { index, device ->
    val base = device.deviceId?.trim()?.takeIf { it.isNotEmpty() }?.let { "id:$it" }
      ?: device.hostname?.trim()?.takeIf { it.isNotEmpty() }?.let { "host:$it" }
      ?: "index:$index"
    val occurrence = occurrences[base] ?: 0
    occurrences[base] = occurrence + 1
    KeyedDevice(device, if (occurrence == 0) base else "$base#$occurrence")
  }
}
