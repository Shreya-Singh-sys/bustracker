// src/models/busModel.js
import { supabase } from '../config/database.js';

// Function used by the ETA service to find all buses running right now
async function getAllActiveBusLocations() {
    try {
        // Queries the table where buses periodically push their location
        const { data, error } = await supabase
            .from('realtime_locations') // Assumed new table name
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

// Function used by your GPS receiving endpoint (e.g., POST /api/gps)
async function updateBusLocation(locationData) {
    try {
        const { bus_id, latitude, longitude, trip_id } = locationData;

        // Uses upsert to either insert a new row or update an existing one for the bus
        const { data, error } = await supabase
            .from('realtime_locations')
            .upsert({
                bus_id: bus_id,
                latitude: latitude,
                longitude: longitude,
                trip_id: trip_id,
                timestamp: new Date().toISOString()
            }, {
                onConflict: 'bus_id', // Update the existing row for this bus ID
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
export const busModel = {
    getAllActiveBusLocations,
    updateBusLocation,
};
