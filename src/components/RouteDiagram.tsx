import type { RouteResult } from "@/lib/types"

interface RouteDiagramProps {
  route: RouteResult
}

export default function RouteDiagram({ route }: RouteDiagramProps) {
  return (
    <div className="space-y-0">
      {route.segments.map((segment, segIdx) => (
        <div key={segIdx}>
          {/* Transfer indicator */}
          {segIdx > 0 && (
            <div className="flex items-center gap-3 py-2 pl-[18px]">
              <div className="w-0 border-l-2 border-dashed border-gray-300 h-6" />
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Transfer at {route.transfers[segIdx - 1]?.stationName} (~3 min)
              </span>
            </div>
          )}

          {/* Segment */}
          <div className="relative">
            {/* Line color bar */}
            <div
              className="absolute left-[18px] top-0 bottom-0 w-1 rounded-full"
              style={{ backgroundColor: segment.line.color }}
            />

            {/* Stations in this segment */}
            {segment.stations.map((station, stIdx) => {
              const isFirst = stIdx === 0
              const isLast = stIdx === segment.stations.length - 1
              const isEndpoint = (segIdx === 0 && isFirst) || (segIdx === route.segments.length - 1 && isLast)

              return (
                <div key={station.id} className="flex items-start gap-3 relative">
                  {/* Station dot */}
                  <div className="relative z-10 flex-shrink-0 pt-2">
                    <div
                      className={`rounded-full border-2 ${
                        isEndpoint
                          ? "w-5 h-5 border-gray-900 bg-white"
                          : isFirst || isLast
                          ? "w-3.5 h-3.5 border-white bg-white ring-2"
                          : "w-2.5 h-2.5 border-white"
                      }`}
                      style={{
                        backgroundColor:
                          isEndpoint ? "white" : segment.line.color,
                        ...(isFirst || isLast
                          ? { ringColor: segment.line.color }
                          : {}),
                      }}
                    />
                  </div>

                  {/* Station info */}
                  <div className={`py-1.5 flex-1 ${isEndpoint ? "font-semibold" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isEndpoint ? "text-gray-900" : "text-gray-700"}`}>
                        {station.name}
                      </span>
                      {isFirst && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: segment.line.color + "15",
                            color: segment.line.color,
                          }}
                        >
                          {segment.line.name}
                        </span>
                      )}
                    </div>
                    {isEndpoint && (segIdx === 0 && isFirst) && (
                      <span className="text-xs text-gray-500">Departure</span>
                    )}
                    {isEndpoint && (segIdx === route.segments.length - 1 && isLast) && (
                      <span className="text-xs text-gray-500">Arrival</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
