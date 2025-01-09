interface GraphNode {
    to: number;
    line: number;
}

interface Graph {
    [key: number]: GraphNode[];
}

interface Distance {
    cost: number;
    currentLine?: number | null;
}

interface PreviousNode {
    node: number | null;
    line: number | null;
}

interface DijkstraResult {
    path: number[];
    totalCost: number | null;
    previous: Record<number, PreviousNode | null>;
}

export function dijkstra(graph: Graph, startGcd: number, targetGcd: number): DijkstraResult {
    // Define costs
    const STATION_HOP_COST = 3; //  minutes between stations
    const TRANSFER_COST = 6; // 8 minutes per line transfer

    const distances: Record<number, Distance> = {};
    const previous: Record<number, PreviousNode | null> = {};
    const visited = new Set<number>();

    // Priority queue (min heap implemented with Map for simplicity)
    const pq = new Map<number, Distance>();

    // Initialize distances and previous nodes
    Object.keys(graph).forEach((node) => {
        const nodeNumber = parseInt(node, 10);
        distances[nodeNumber] = { cost: Infinity };
        previous[nodeNumber] = null;
    });

    distances[startGcd] = { cost: 0, currentLine: null };
    pq.set(startGcd, { cost: 0, currentLine: null });

    while (pq.size > 0) {
        // Find node with smallest cost
        const [currentNode, currentData] = [...pq.entries()].reduce((min, entry) =>
            entry[1].cost < min[1].cost ? entry : min,
        );
        pq.delete(currentNode);

        if (currentNode === targetGcd) break;
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);

        // Process neighbors
        graph[currentNode].forEach((neighbor) => {
            const { to, line } = neighbor;

            // Check for line transfer cost
            const isTransfer = currentData.currentLine !== null && currentData.currentLine !== line;
            const lineChangeCost = isTransfer ? TRANSFER_COST : 0;

            // Calculate alternative cost
            const altCost = currentData.cost + STATION_HOP_COST + lineChangeCost;

            if (altCost < distances[to]?.cost) {
                distances[to] = { cost: altCost, currentLine: line };
                previous[to] = { node: currentNode, line };
                pq.set(to, { cost: altCost, currentLine: line });
            }
        });
    }

    // Reconstruct the path
    const path: number[] = [];
    let node: number | null = targetGcd;
    while (node !== null) {
        path.unshift(node);
        node = previous[node]?.node || null;
    }

    return {
        path,
        totalCost: distances[targetGcd]?.cost !== Infinity ? distances[targetGcd]?.cost : null,
        previous,
    };
}
