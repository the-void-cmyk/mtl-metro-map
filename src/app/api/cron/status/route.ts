import { NextRequest, NextResponse } from "next/server"
import { upsertServiceStatus } from "@/lib/db"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime

// Add API keys to env vars to enable live feeds:
//   STM_API_KEY - from stm.info/en/about/developers
//   EXO_API_KEY - from exo.quebec/en/about/open-data

interface AlertEntry {
  lineId: string
  status: "normal" | "delayed" | "interrupted" | "planned"
  message: string | null
  messageFr: string | null
  source: string
}

// Map GTFS route IDs to our line IDs
const ROUTE_TO_LINE: Record<string, string> = {
  // STM Metro
  "1": "green",
  "2": "orange",
  "4": "yellow",
  "5": "blue",
  // Exo commuter trains
  "11": "exo1",
  "12": "exo2",
  "13": "exo3",
  "14": "exo4",
  "15": "exo5",
}

function parseProtobufFeed(buffer: ArrayBuffer, source: string): AlertEntry[] {
  const feed = FeedMessage.decode(new Uint8Array(buffer))
  const alerts: AlertEntry[] = []

  for (const entity of feed.entity) {
    const alert = entity.alert
    if (!alert) continue

    const routeIds = (alert.informedEntity ?? [])
      .map((ie) => ie.routeId)
      .filter(Boolean) as string[]

    const enText = alert.headerText?.translation?.find((t) => t.language === "en")?.text ?? null
    const frText = alert.headerText?.translation?.find((t) => t.language === "fr")?.text ?? null

    const effect = alert.effect ?? 0
    let status: AlertEntry["status"] = "delayed"
    // GTFS-RT Effect enum: 1=NO_SERVICE, 2=REDUCED_SERVICE, 6=MODIFIED_SERVICE
    if (effect === 1) status = "interrupted"
    else if (effect === 2 || effect === 6) status = "delayed"
    else if (effect === 0) status = "delayed" // UNKNOWN_EFFECT, treat as delay

    for (const routeId of routeIds) {
      const lineId = ROUTE_TO_LINE[routeId]
      if (lineId) {
        alerts.push({ lineId, status, message: enText, messageFr: frText, source })
      }
    }
  }

  return alerts
}

async function fetchSTMAlerts(): Promise<AlertEntry[]> {
  const apiKey = process.env.STM_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(
      "https://api.stm.info/pub/od/gtfs-rt/ic/v2/serviceAlerts",
      {
        headers: { apiKey },
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!res.ok) return []

    const buffer = await res.arrayBuffer()
    return parseProtobufFeed(buffer, "stm")
  } catch {
    return []
  }
}

async function fetchExoAlerts(): Promise<AlertEntry[]> {
  const apiKey = process.env.EXO_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(
      "https://exo.chrono-saeiv.com/api/opendata/v1/TRAINS/alert",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!res.ok) return []

    const buffer = await res.arrayBuffer()
    return parseProtobufFeed(buffer, "exo")
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let stmError: string | null = null
  let exoError: string | null = null
  let stmAlerts: AlertEntry[] = []
  let exoAlerts: AlertEntry[] = []

  try {
    stmAlerts = await fetchSTMAlerts()
  } catch (e) {
    stmError = String(e)
  }

  try {
    exoAlerts = await fetchExoAlerts()
  } catch (e) {
    exoError = String(e)
  }

  const allAlerts = [...stmAlerts, ...exoAlerts]

  // Update DB with alerts
  let updated = 0
  for (const alert of allAlerts) {
    await upsertServiceStatus(alert.lineId, alert.status, alert.message, alert.messageFr, alert.source)
    updated++
  }

  // Lines with no alerts get set to normal (only if we actually fetched from a source)
  const ALL_LINES = ["green", "orange", "blue", "yellow", "rem-a", "exo1", "exo2", "exo3", "exo4", "exo5"]
  const alertedLines = new Set(allAlerts.map((a) => a.lineId))

  const hasStmKey = !!process.env.STM_API_KEY
  const hasExoKey = !!process.env.EXO_API_KEY

  for (const lineId of ALL_LINES) {
    if (alertedLines.has(lineId)) continue

    const isStm = ["green", "orange", "blue", "yellow"].includes(lineId)
    const isExo = lineId.startsWith("exo")

    // Only clear to normal if we successfully checked the relevant feed
    if ((isStm && hasStmKey && !stmError) || (isExo && hasExoKey && !exoError)) {
      await upsertServiceStatus(lineId, "normal", null, null, isStm ? "stm" : "exo")
      updated++
    }
  }

  return NextResponse.json({
    ok: true,
    alertsFound: allAlerts.length,
    linesUpdated: updated,
    sources: {
      stm: stmError ? `error: ${stmError}` : hasStmKey ? "connected" : "no_api_key",
      exo: exoError ? `error: ${exoError}` : hasExoKey ? "connected" : "no_api_key",
      rem: "coming_soon",
    },
    timestamp: new Date().toISOString(),
  })
}
