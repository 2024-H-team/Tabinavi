import { loadGraphFromFile } from './graphBuilder';
import { BuildGraphResult } from './buildGraph';

// Local variable to store the loaded graphData
let graphData: BuildGraphResult | null = null;

/**
 * Initialize the graph (only needs to be called once when the server starts).
 * If `graphData` already exists, do not load it again.
 */
export async function initGraph(): Promise<BuildGraphResult> {
    if (!graphData) {
        graphData = await loadGraphFromFile();
    }
    return graphData;
}

/**
 * Retrieve the pre-loaded graphData from memory.
 * Throw an error if not initialized.
 */
export function getGraph(): BuildGraphResult {
    if (!graphData) {
        throw new Error('Graph has not been initialized yet!');
    }
    return graphData;
}
