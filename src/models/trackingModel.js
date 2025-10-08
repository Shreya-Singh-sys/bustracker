// src/models/trackingModel.js
import { supabase } from '../config/database.js';

// -------------------------------------------------------------
// 1. READ: Get All Active Bus Locations
// Used by the ETACalculationService to find out where every bus is right now.
// -------------------------------------------------------------

/**
 * Fetches the most recent location data for all active buses.
 * @returns {Array} List of current bus location objects
 */
async function getAllActiveBusLocations() {
    try {
        const { data, error } = await supabase
            .from('realtime_locations') // <-- USE YOUR ACTUAL REAL-TIME TABLE NAME
            .select(`
                bus_id,
                latitude, 
                longitude, 
                trip_id, 
                timestamp
            `);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching active bus locations:', error.message);
        return [];
    }
}

// -------------------------------------------------------------
// 2. WRITE/UPDATE: Submit New Bus Location
// Used by your GPS receiving API endpoint (e.g., POST /api/gps)
// -------------------------------------------------------------

/**
 * Updates or inserts the latest GPS coordinates for a specific bus.
 * Uses 'upsert' to handle both new buses and updates to existing buses.
 * @param {object} locationData - Contains bus_id, latitude, longitude, and trip_id
 * @returns {object} The updated data or throws an error
 */
async function updateBusLocation(locationData) {
    try {
        const { bus_id, latitude, longitude, trip_id } = locationData;

        const { data, error } = await supabase
            .from('realtime_locations')
            .upsert({
                bus_id: bus_id,
                latitude: latitude,
                longitude: longitude,
                trip_id: trip_id,
                timestamp: new Date().toISOString()
            }, {
                onConflict: 'bus_id', // Tells Supabase to UPDATE if 'bus_id' already exists
                ignoreDuplicates: false
            });

        if (error) throw error;
        console.log(`Location updated for bus ${bus_id}`);
        return data;
    } catch (error) {
        console.error('Error updating bus location:', error.message);
        throw error;
    }
}
export const trackingModel = {
    getAllActiveBusLocations,
    updateBusLocation,
};
