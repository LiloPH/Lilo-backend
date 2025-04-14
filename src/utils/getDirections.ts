import { Client } from "@googlemaps/google-maps-services-js";
const client = new Client({});

interface LatLng {
  latitude: number;
  longitude: number;
}

interface DirectionsResult {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  duration_in_traffic?: { text: string; value: number };
  polyline: string;
  start_address: string;
  end_address: string;
}

const getDirections = async (
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[] = [],
  mode: "walking" | "driving" | "bicycling" | "transit" = "walking"
): Promise<DirectionsResult | null> => {
  try {
    const params: any = {
      // Using 'any' to avoid complex type definitions for google maps params
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: mode,
      key: process.env.GOOGLE_MAPS_API_KEY,
    };

    // Add waypoints as via points to ensure the route follows these points
    if (waypoints.length > 0) {
      params.waypoints = waypoints.map(
        (point) => `via:${point.latitude},${point.longitude}`
      );
    }

    const response = await client.directions({
      params: params,
    });

    if (response.data.status === "OK" && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance,
        duration:
          mode === "driving" && leg.duration_in_traffic
            ? leg.duration_in_traffic
            : leg.duration,
        polyline: route.overview_polyline.points,
        start_address: leg.start_address,
        end_address: leg.end_address,
      };
    }
    return null;
  } catch (error) {
    // console.error("Error getting directions:", error);
    return null;
  }
};

export { getDirections };
