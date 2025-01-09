import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { dijkstra } from '../utils/dijkstra';
import { getGraph } from '../utils/graphManager';
import { BuildGraphResult, Station, Connection } from '../utils/buildGraph';

interface StationRow extends Station, RowDataPacket {}
interface ConnectionRow extends Connection, RowDataPacket {}
interface LineRow extends RowDataPacket {
    line_cd: number;
    line_name: string;
}

interface GroupedStations {
    [key: number]: StationRow[];
}

interface RouteStep {
    from: number;
    from_name: string | null;
    to: number;
    to_name: string | null;
    line: string | null;
}

interface DetailedTransfer {
    station_name: string | undefined;
    from_line: string | undefined;
    to_line: string | undefined;
}

interface BestRoute {
    start_name: string;
    end_name: string;
    totalCost: number;
    route: RouteStep[];
    transfers: DetailedTransfer[];
}

export async function findStationsByName(name: string): Promise<GroupedStations> {
    const [stations] = await pool.query<StationRow[]>(
        `SELECT station_cd, station_g_cd, station_name, lat, lon 
         FROM railway_stations 
         WHERE station_name = ?`,
        [name],
    );

    if (!stations.length) {
        throw new Error(`Station "${name}" not found`);
    }

    const groupedStations: GroupedStations = {};
    stations.forEach((station) => {
        if (!groupedStations[station.station_g_cd]) {
            groupedStations[station.station_g_cd] = [];
        }
        groupedStations[station.station_g_cd].push(station);
    });

    stations.forEach((station) => {
        stations.forEach((otherStation) => {
            if (
                station.station_cd !== otherStation.station_cd &&
                station.lat === otherStation.lat &&
                station.lon === otherStation.lon
            ) {
                if (!groupedStations[station.station_g_cd].includes(otherStation)) {
                    groupedStations[station.station_g_cd].push(otherStation);
                }
            }
        });
    });

    return groupedStations;
}

export async function findShortestRoute(startName: string, endName: string): Promise<BestRoute> {
    const startGroups = await findStationsByName(startName);
    const endGroups = await findStationsByName(endName);

    const startGcds = Object.keys(startGroups).map(Number);
    const endGcds = Object.keys(endGroups).map(Number);

    const [stations] = await pool.query<StationRow[]>(
        'SELECT station_cd, station_g_cd, station_name, lat, lon FROM railway_stations',
    );

    const [connections] = await pool.query<ConnectionRow[]>(
        'SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections',
    );

    const [lines] = await pool.query<LineRow[]>('SELECT line_cd, line_name FROM railway_lines');

    const graphData: BuildGraphResult = getGraph();

    let bestRoute: BestRoute | null = null;
    let minCost = Infinity;

    for (const startGcd of startGcds) {
        for (const endGcd of endGcds) {
            const { path, totalCost, previous } = dijkstra(graphData.graph, startGcd, endGcd);

            if (totalCost !== null && totalCost < minCost) {
                minCost = totalCost;

                const route: RouteStep[] = [];
                const detailedTransfers: DetailedTransfer[] = [];
                let previousLine: number | null = null;

                for (let i = 0; i < path.length - 1; i++) {
                    const currentGcd = path[i];
                    const nextGcd = path[i + 1];
                    const lineCd = previous[nextGcd]?.line;
                    if (!lineCd) continue;

                    const currentCandidates = graphData.groupedStations[currentGcd];
                    const nextCandidates = graphData.groupedStations[nextGcd];

                    let chosenCurrentCd: number | null = null;
                    let chosenNextCd: number | null = null;

                    outerLoop: for (const ccd of currentCandidates) {
                        for (const ncd of nextCandidates) {
                            const conn = connections.find(
                                (conn) =>
                                    ((conn.station_cd1 === ccd && conn.station_cd2 === ncd) ||
                                        (conn.station_cd1 === ncd && conn.station_cd2 === ccd)) &&
                                    conn.line_cd === lineCd,
                            );
                            if (conn) {
                                chosenCurrentCd = ccd;
                                chosenNextCd = ncd;
                                break outerLoop;
                            }
                        }
                    }

                    const fromStation = stations.find((s) => s.station_cd === chosenCurrentCd);
                    const toStation = stations.find((s) => s.station_cd === chosenNextCd);
                    const lineObj = lines.find((l) => l.line_cd === lineCd);

                    route.push({
                        from: chosenCurrentCd!,
                        from_name: fromStation?.station_name || null,
                        to: chosenNextCd!,
                        to_name: toStation?.station_name || null,
                        line: lineObj?.line_name || null,
                    });

                    if (previousLine !== null && previousLine !== lineCd) {
                        const transferStation = fromStation || toStation;
                        detailedTransfers.push({
                            station_name: transferStation?.station_name,
                            from_line: lines.find((l) => l.line_cd === previousLine)?.line_name,
                            to_line: lineObj?.line_name,
                        });
                    }
                    previousLine = lineCd;
                }

                bestRoute = {
                    start_name: startName,
                    end_name: endName,
                    totalCost: minCost,
                    route,
                    transfers: detailedTransfers,
                };
            }
        }
    }

    if (!bestRoute) {
        throw new Error(`No route found between "${startName}" and "${endName}"`);
    }

    return bestRoute;
}
