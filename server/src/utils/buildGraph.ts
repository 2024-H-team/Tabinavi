export interface Station {
    station_cd: number;
    station_g_cd: number;
    station_name: string;
    lat: number;
    lon: number;
}

export interface Connection {
    station_cd1: number;
    station_cd2: number;
    line_cd: number;
}

export interface GraphNode {
    to: number;
    line: number;
}

export interface BuildGraphResult {
    graph: Record<number, GraphNode[]>;
    groupedStations: Record<number, number[]>;
}

export function buildGraph(connections: Connection[], stations: Station[]): BuildGraphResult {
    const graph: Record<number, GraphNode[]> = {};
    const groupedStations: Record<number, number[]> = {};

    // Group stations by station_g_cd
    stations.forEach((station) => {
        if (!groupedStations[station.station_g_cd]) {
            groupedStations[station.station_g_cd] = [];
        }
        groupedStations[station.station_g_cd].push(station.station_cd);
    });

    // Add stations with the same lat/lon to the same group
    stations.forEach((station) => {
        const stationGroup = groupedStations[station.station_g_cd];
        stations.forEach((otherStation) => {
            if (
                station.station_cd !== otherStation.station_cd &&
                station.lat === otherStation.lat &&
                station.lon === otherStation.lon
            ) {
                if (!stationGroup.includes(otherStation.station_cd)) {
                    stationGroup.push(otherStation.station_cd);
                }
            }
        });
    });

    // Build graph from connections
    connections.forEach((conn) => {
        const station1 = stations.find((s) => s.station_cd === conn.station_cd1);
        const station2 = stations.find((s) => s.station_cd === conn.station_cd2);

        if (!station1 || !station2) return;

        const stationGcd1 = station1.station_g_cd;
        const stationGcd2 = station2.station_g_cd;

        if (stationGcd1 && stationGcd2 && stationGcd1 !== stationGcd2) {
            graph[stationGcd1] = graph[stationGcd1] || [];
            graph[stationGcd1].push({ to: stationGcd2, line: conn.line_cd });

            graph[stationGcd2] = graph[stationGcd2] || [];
            graph[stationGcd2].push({ to: stationGcd1, line: conn.line_cd });
        }
    });

    return { graph, groupedStations };
}
