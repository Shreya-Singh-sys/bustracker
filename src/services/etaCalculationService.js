// src/services/ETACalculationService.js
import { busModel} from '../models/busModel.js';
import { stopModel } from '../models/stopModel.js';

// *** This function is the core of your ETA service. ***
async function calculateAllETAs() {
    console.log('Starting ETA calculation cycle...');

    try {
        // 1. Get all currently running buses and their location
        const activeBuses = await busModel.getAllActiveBusLocations();


        
        
        if (activeBuses.length === 0) {
            console.log('No active buses found to calculate ETAs.');
            return;
        }

        // 2. Iterate through each active bus
        for (const bus of activeBuses) {
            const tripId = bus.trip_id;
            
            // 3. Get the scheduled stops for this bus's trip
            const scheduledStops = await getStopsForTrip(tripId);

            if (scheduledStops.length === 0) {
                console.warn(`Trip ID ${tripId} has no scheduled stops.`);
                continue;
            }

            // 4. Find the next stop based on current location (Simplified Logic)
            const nextStop = findNextStop(bus, scheduledStops);
            
            if (!nextStop) {
                console.log(`Bus ${bus.bus_id} is at the end of its trip.`);
                continue;
            }

            // 5. Calculate the ETA (This involves complex spatial/time math)
            const etaInMinutes = simpleETACalculation(bus, nextStop);

            console.log(`Bus ${bus.bus_id} ETA to ${nextStop.stop_name}: ${etaInMinutes} minutes.`);
            
            // 6. Push the result to a display table or WebSocket
            // await publishETA({ busId: bus.bus_id, stopId: nextStop.stop_id, eta: etaInMinutes });
        }
        
    } catch (error) {
        console.error('Error calculating ETAs:', error.message);
    }
}

// --- Simplified Placeholder Functions (You will need to replace these) ---

// Placeholder: Finds the next stop a bus should reach
function findNextStop(bus, scheduledStops) {
    // A robust function would use geospatial libraries (like Turf.js) 
    // to determine which scheduled stop the bus is currently approaching.
    
    // Simple placeholder: Assume the next stop is the one after the last one the bus passed
    return scheduledStops.find(stop => stop.stop_sequence > 1); 
}

// Placeholder: A simple calculation (e.g., based on distance or scheduled time deviation)
function simpleETACalculation(bus, nextStop) {
    const DISTANCE_FACTOR = 0.5; // Dummy calculation
    
    // Calculate distance between bus location (lat/lon) and nextStop (lat/lon)
    // For this example, we just return a fixed time
    return Math.round(Math.random() * 10) + 1; 
}

// Call the function repeatedly (e.g., every 30 seconds)
// setInterval(calculateAllETAs, 30000);
export const etaCalculationService = {
    calculateAllETAs,
};