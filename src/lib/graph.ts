import type { Connection } from './types'

interface GraphNode {
  stationId: string
  edges: GraphEdge[]
}

interface GraphEdge {
  to: string
  weight: number // travel time in minutes
  lineId: string
  type: 'rail' | 'walk'
}

interface DijkstraResult {
  path: string[] // ordered station IDs
  totalTime: number
  edges: GraphEdge[] // edges used in the path
}

export class TransitGraph {
  private nodes: Map<string, GraphNode> = new Map()
  private static TRANSFER_PENALTY = 3 // minutes added when switching lines at same station

  constructor(connections: Connection[]) {
    this.buildGraph(connections)
  }

  private buildGraph(connections: Connection[]): void {
    for (const conn of connections) {
      // Ensure both nodes exist
      if (!this.nodes.has(conn.from)) {
        this.nodes.set(conn.from, { stationId: conn.from, edges: [] })
      }
      if (!this.nodes.has(conn.to)) {
        this.nodes.set(conn.to, { stationId: conn.to, edges: [] })
      }

      // Add bidirectional edges
      this.nodes.get(conn.from)!.edges.push({
        to: conn.to,
        weight: conn.travelTime,
        lineId: conn.lineId,
        type: conn.type,
      })
      this.nodes.get(conn.to)!.edges.push({
        to: conn.from,
        weight: conn.travelTime,
        lineId: conn.lineId,
        type: conn.type,
      })
    }
  }

  /**
   * Dijkstra's algorithm with line-transfer penalties.
   * State = (stationId, currentLineId) to properly account for transfer time.
   */
  findShortestPath(
    fromId: string,
    toId: string,
    options?: { transferPenalty?: number; edgePenalties?: Set<string> }
  ): DijkstraResult | null {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      return null
    }
    if (fromId === toId) {
      return { path: [fromId], totalTime: 0, edges: [] }
    }

    // State: "stationId:lineId" to track which line we're currently on
    const dist = new Map<string, number>()
    const prev = new Map<string, { state: string; edge: GraphEdge } | null>()
    const visited = new Set<string>()

    // Priority queue (simple array-based, fine for ~300 nodes)
    const queue: Array<{ state: string; cost: number }> = []

    // Initialize: start from fromId with no line (first boarding is free)
    const startState = `${fromId}:_start`
    dist.set(startState, 0)
    prev.set(startState, null)
    queue.push({ state: startState, cost: 0 })

    while (queue.length > 0) {
      // Get minimum cost state
      queue.sort((a, b) => a.cost - b.cost)
      const current = queue.shift()!

      if (visited.has(current.state)) continue
      visited.add(current.state)

      const [currentStation, currentLine] = current.state.split(':') as [string, string]

      // Check if we reached the destination (on any line)
      if (currentStation === toId) {
        // Reconstruct path
        return this.reconstructPath(current.state, prev)
      }

      const node = this.nodes.get(currentStation)
      if (!node) continue

      const penalty = options?.transferPenalty ?? TransitGraph.TRANSFER_PENALTY
      const edgePenalties = options?.edgePenalties

      for (const edge of node.edges) {
        const nextState = `${edge.to}:${edge.lineId}`

        // Calculate cost: travel time + transfer penalty if switching lines
        let transferCost = 0
        if (currentLine !== '_start' && currentLine !== edge.lineId) {
          transferCost = penalty
        }

        // Add edge penalty if this edge is in the penalized set
        let edgeCost = 0
        if (edgePenalties) {
          const edgeKey = `${currentStation}->${edge.to}:${edge.lineId}`
          const reverseKey = `${edge.to}->${currentStation}:${edge.lineId}`
          if (edgePenalties.has(edgeKey) || edgePenalties.has(reverseKey)) {
            edgeCost = 15
          }
        }

        const newCost = current.cost + edge.weight + transferCost + edgeCost

        const currentDist = dist.get(nextState)
        if (currentDist === undefined || newCost < currentDist) {
          dist.set(nextState, newCost)
          prev.set(nextState, { state: current.state, edge })
          queue.push({ state: nextState, cost: newCost })
        }
      }
    }

    return null // no path found
  }

  private reconstructPath(
    endState: string,
    prev: Map<string, { state: string; edge: GraphEdge } | null>
  ): DijkstraResult {
    const path: string[] = []
    const edges: GraphEdge[] = []
    let current: string | undefined = endState
    let totalTime = 0

    while (current) {
      const [stationId] = current.split(':')
      path.unshift(stationId)

      const prevEntry = prev.get(current)
      if (prevEntry) {
        edges.unshift(prevEntry.edge)
        totalTime += prevEntry.edge.weight

        // Add transfer penalty
        const [, prevLine] = prevEntry.state.split(':')
        if (prevLine !== '_start' && prevLine !== prevEntry.edge.lineId) {
          totalTime += TransitGraph.TRANSFER_PENALTY
        }

        current = prevEntry.state
      } else {
        break
      }
    }

    // Remove duplicate consecutive stations (from line transfers at same station)
    const dedupedPath: string[] = []
    for (const stationId of path) {
      if (dedupedPath.length === 0 || dedupedPath[dedupedPath.length - 1] !== stationId) {
        dedupedPath.push(stationId)
      }
    }

    return { path: dedupedPath, totalTime, edges }
  }

  getStationCount(): number {
    return this.nodes.size
  }

  hasStation(id: string): boolean {
    return this.nodes.has(id)
  }
}
