import fs from 'fs';
import path from 'path';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { buildGraph } from './buildGraph';
import { Connection, Station, BuildGraphResult } from './buildGraph';

const GRAPH_FILE_PATH = path.join(__dirname, 'data', 'graph.json');

export async function buildAndSaveGraph(): Promise<void> {
    try {
        // Query dữ liệu từ database
        const [stations] = await pool.query<RowDataPacket[]>(
            'SELECT station_cd, station_g_cd, station_name, lat, lon FROM railway_stations',
        );
        const [connections] = await pool.query<RowDataPacket[]>(
            'SELECT station_cd1, station_cd2, line_cd FROM railway_line_connections',
        );

        // Build đồ thị
        const graphData: BuildGraphResult = buildGraph(connections as Connection[], stations as Station[]);

        // Lưu đồ thị vào file JSON
        fs.writeFileSync(GRAPH_FILE_PATH, JSON.stringify(graphData, null, 2));
        console.log('Graph has been built and saved successfully.');
    } catch (error) {
        console.error('Error building the graph:', error);
        throw error;
    }
}

export async function loadGraphFromFile(): Promise<BuildGraphResult> {
    try {
        if (!fs.existsSync(GRAPH_FILE_PATH)) {
            console.log('Graph file not found. Building graph...');
            await buildAndSaveGraph();
        }

        const data = fs.readFileSync(GRAPH_FILE_PATH, 'utf-8');
        console.log('Graph loaded from file successfully.');
        return JSON.parse(data) as BuildGraphResult;
    } catch (error) {
        console.error('Error loading or building graph from file:', error);
        throw error;
    }
}
