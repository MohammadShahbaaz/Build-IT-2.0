// This file is the brain of Build-IT.
// It takes a user's selected parts and returns
// a list of compatibility issues (or an empty list if all good).

export type SelectedBuild = {
  cpu?: {
    name: string
    socket: string
    tdp: number
  }
  motherboard?: {
    name: string
    socket: string
    ram_type: string
  }
  ram?: {
    name: string
    ram_type: string
  }
  gpu?: {
    name: string
    tdp: number
  }
  psu?: {
    name: string
    wattage: number
  }
}

export type CompatibilityIssue = {
  severity: 'error' | 'warning'
  message: string
}

export function checkCompatibility(build: SelectedBuild): CompatibilityIssue[] {
  // We collect all issues into this array and return it at the end
  const issues: CompatibilityIssue[] = []

  // ✅ CHECK 1: CPU socket must match motherboard socket
  // e.g. AM5 cpu needs AM5 motherboard — they physically won't fit otherwise
  if (build.cpu && build.motherboard) {
    if (build.cpu.socket !== build.motherboard.socket) {
      issues.push({
        severity: 'error',
        message: `❌ ${build.cpu.name} uses socket ${build.cpu.socket} but ${build.motherboard.name} has socket ${build.motherboard.socket}. These are not compatible.`,
      })
    }
  }

  // ✅ CHECK 2: RAM type must match motherboard RAM type
  // DDR4 RAM won't fit in a DDR5 slot — different notch position
  if (build.ram && build.motherboard) {
    if (build.ram.ram_type !== build.motherboard.ram_type) {
      issues.push({
        severity: 'error',
        message: `❌ ${build.ram.name} is ${build.ram.ram_type} but ${build.motherboard.name} only supports ${build.motherboard.ram_type}. Not compatible.`,
      })
    }
  }

  // ✅ CHECK 3: PSU wattage must cover total system power draw
  // We add CPU + GPU TDP and require PSU to have 20% headroom on top
  // e.g. CPU 125W + GPU 200W = 325W total, so you need at least 390W PSU
  if (build.psu && (build.cpu || build.gpu)) {
    const cpuTdp = build.cpu?.tdp ?? 0
    const gpuTdp = build.gpu?.tdp ?? 0
    const totalTdp = cpuTdp + gpuTdp
    const requiredWattage = Math.ceil(totalTdp * 1.2) // 20% headroom

    if (build.psu.wattage < requiredWattage) {
      issues.push({
        severity: 'error',
        message: `❌ Your system needs ~${requiredWattage}W (CPU: ${cpuTdp}W + GPU: ${gpuTdp}W + 20% headroom) but your PSU is only ${build.psu.wattage}W. Risk of crashes or damage.`,
      })
    } else if (build.psu.wattage > totalTdp * 2) {
      // Warn if PSU is massively oversized — wastes money
      issues.push({
        severity: 'warning',
        message: `⚠️ Your ${build.psu.wattage}W PSU is much more than needed for this build (~${requiredWattage}W required). Consider a smaller PSU to save money.`,
      })
    }
  }

  return issues
}