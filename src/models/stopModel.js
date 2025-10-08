import { supabase } from '../config/database.js';

// Function to get details for a specific stop
async function getStopDetails(stopId) {
    try {
        const { data, error } = await supabase
            .from('stops') // The GTFS 'stops.txt' table
            .select('stop_name, stop_lat, stop_lon')
            .eq('stop_id', stopId)
            .single(); // Expecting one stop result

        if (error) throw error;
        return data;

    } catch (error) {
        console.error('Error fetching stop details:', error.message);
        return null;
    }
}

// Function to get all stops for a specific route (via stop_times -> trips -> routes)
async function getStopsForTrip(tripId) {
    try {
        // This query joins stop_times with stops to get the sequence and details
        const { data, error } = await supabase
            .from('stop_times')
            .select(`
                stop_sequence, 
                arrival_time, 
                stops (stop_id, stop_name, stop_lat, stop_lon)
            `)
            .eq('trip_id', tripId)
            .order('stop_sequence', { ascending: true }); // Ensure stops are in order

        if (error) throw error;
        // The data will be structured as a list of stop times, each with the stop object nested
        return data.map(st => ({
            sequence: st.stop_sequence,
            time: st.arrival_time,
            ...st.stops
        }));

    } catch (error) {
        console.error('Error fetching stops for trip:', error.message);
        return [];
    }
}
export const stopModel = {
    getStopDetails,
    getStopsForTrip,
};