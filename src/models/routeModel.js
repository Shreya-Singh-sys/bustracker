// src/models/routeModel.js
import { supabase } from '../config/database.js';

/**
 * Fetches all available bus routes, typically used for listing options
 * in a user interface (e.g., a route dropdown menu).
 * @returns {Array} List of route objects
 */
async function getAllRoutes() {
    try {
        const { data, error } = await supabase
            .from('routes') // The GTFS 'routes.txt' table
            .select(`
                route_id, 
                route_short_name, 
                route_long_name, 
                route_type
            `);

        if (error) throw error;
        
        // Return only the essential, presentable route details
        return data.map(route => ({
            id: route.route_id,
            name: route.route_short_name || route.route_long_name,
            type: route.route_type
        }));

    } catch (error) {
        console.error('Error fetching all routes:', error.message);
        return [];
    }
}

// -------------------------------------------------------------

/**
 * Fetches the specific details for a single route ID.
 * @param {string} routeId - The unique ID of the route
 * @returns {object} Single route object or null
 */
async function getRouteDetails(routeId) {
    try {
        const { data, error } = await supabase
            .from('routes')
            .select('*')
            .eq('route_id', routeId)
            .single(); // Expecting one route result

        if (error) throw error;
        return data;

    } catch (error) {
        console.error(`Error fetching details for route ${routeId}:`, error.message);
        return null;
    }
}

// -------------------------------------------------------------

/**
 * Fetches all trips (scheduled runs) associated with a specific route.
 * This is crucial for linking a route to the actual bus services running.
 * @param {string} routeId - The ID of the route
 * @returns {Array} List of trip objects
 */
async function getTripsByRoute(routeId) {
    try {
        const { data, error } = await supabase
            .from('trips') // The GTFS 'trips.txt' table
            .select(`
                trip_id,
                service_id,
            `)
            .eq('route_id', routeId);

        if (error) throw error;
        return data;

    } catch (error) {
        console.error(`Error fetching trips for route ${routeId}:`, error.message);
        return [];
    }
}
export const routeModel = {
    getAllRoutes,
    getTripsByRoute,
    getRouteDetails,
};
