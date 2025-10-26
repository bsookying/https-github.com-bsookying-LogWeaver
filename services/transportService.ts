import type { SimulationConfig } from '../types';

/**
 * Sends a log message to the configured XSIAM HTTP collector endpoint.
 * @param config - The simulation configuration containing the URL and API key.
 * @param logMessage - The raw CEF log string to send.
 */
export async function sendToXsiam(config: SimulationConfig, logMessage: string): Promise<void> {
    const { xsiamUrl, xsiamApiKey } = config;

    // Do not attempt to send if the configuration is incomplete.
    if (!xsiamUrl || !xsiamApiKey) {
        // Silently fail to avoid console noise if user hasn't configured it.
        // The UI will reflect that forwarding is not active.
        return;
    }

    // XSIAM HTTP collectors expect a specific JSON format.
    // We wrap our CEF string inside this payload.
    const payload = {
        "source": "LogWeaverSimulator",
        "log_type": "cef",
        "logs": [
            { "message": logMessage }
        ]
    };

    try {
        const response = await fetch(xsiamUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': xsiamApiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorBody}`);
        }
        
        // Success, no need to return anything.
        
    } catch (error) {
        console.error('Failed to send log to XSIAM:', error);
        throw error; // Re-throw to be caught by the simulation service
    }
}