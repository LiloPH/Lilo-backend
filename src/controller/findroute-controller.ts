import { StatusCodes } from "http-status-codes";
import { BadRequest, NotFoundError } from "../errors";
import { JeepneyRoute } from "../models";
import haversine from "haversine-distance";
import { getDirections } from "../utils/getDirections";
import { calculateFare } from "../utils/calculateFare";
// import calculateFare from "../utils/calculateFare";
import { Request, Response } from "express";

const MAX_WALKING_DISTANCE = 400; // Meters (fixed unit consistency)
const MAX_TOTAL_WALKING = 600; // 600 meters total walking

interface LatLng {
  latitude: number;
  longitude: number;
}

interface PointInfo extends LatLng {
  order: number;
  isOutBound: boolean;
  type: "waypoint" | "stop";
  routeNo: string;
  name: string;
  parentOrder?: number;
  distance?: number;
}

interface Route {
  routeName: string;
  routeColor: string;
  routeNo: string;
  transferPoint?: {
    location: {
      lat: number;
      lng: number;
    };
    name: string;
  };
}

interface WalkingSegment {
  polyline: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  address: string;
  origin: LatLng;
  destination: LatLng;
}

interface JeepneySegment {
  polyline: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  fare_estimation: {
    modernized: { regular: number; discounted: number };
    traditional: { regular: number; discounted: number };
  };
  origin: LatLng;
  destination: LatLng;
}

interface Segments {
  walkToPickup?: WalkingSegment;
  jeepneyPath?: JeepneySegment;
  walkFromDropoff?: WalkingSegment;
  firstJeepney?: JeepneySegment;
  transferWalk?: WalkingSegment;
  secondJeepney?: JeepneySegment;
}

interface DirectRoute {
  route: Route;
  duration: { text: string; value: number };
  distance: { text: string; value: number };
  location: {
    origin: LatLng;
    destination: LatLng;
  };
  walkingDistances: {
    toPickup: number;
    fromDropoff: number;
  };
  segments: Segments;
}

interface TransferRoute {
  routes: Route[];
  segments: Segments;
  totalDuration: { text: string; value: number };
  totalDistance: { text: string; value: number };
  totalWalkingDistance: { text: string; value: number };
  totalFare: {
    modernized: { regular: number; discounted: number };
    traditional: { regular: number; discounted: number };
  };
}

export const findRoute = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    throw new BadRequest("Origin and destination must be provided");
  }

  const routes = await JeepneyRoute.find({
    status: { $in: ["completed", "verified"] },
  }).lean();

  const directRoutes: DirectRoute[] = [];

  for (const route of routes as any) {
    const allPoints: PointInfo[] = route.waypoints.flatMap((waypoint: any) => {
      const points: PointInfo[] = [];
      if (waypoint.location?.lat && waypoint.location?.lng) {
        points.push({
          latitude: waypoint.location.lat,
          longitude: waypoint.location.lng,
          order: waypoint.order,
          isOutBound: waypoint.isOutBound,
          type: "waypoint",
          routeNo: route.routeNo,
          name: waypoint.location.name || "",
        });
      }

      return points.concat(
        waypoint.stops
          .filter((stop: any) => stop.location?.lat && stop.location?.lng)
          .map((stop: any) => ({
            latitude: stop.location.lat,
            longitude: stop.location.lng,
            order: stop.order,
            parentOrder: waypoint.order,
            isOutBound: stop.isOutBound,
            type: "stop",
            routeNo: route.routeNo,
            name: stop.name || "",
          }))
      );
    });

    // Find all valid pickup-dropoff pairs
    const validPairs: { pickup: PointInfo; dropoff: PointInfo }[] = [];
    for (const pickup of allPoints) {
      const pickupDist = haversine(origin, {
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      } as LatLng);
      if (pickupDist > MAX_WALKING_DISTANCE) continue;

      for (const dropoff of allPoints) {
        const dropoffDist = haversine(destination, {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude,
        } as LatLng);
        const sameDirection = pickup.isOutBound === dropoff.isOutBound;
        const validOrder = pickup.order < dropoff.order;

        if (
          dropoffDist <= MAX_WALKING_DISTANCE &&
          sameDirection &&
          validOrder &&
          pickup.routeNo === dropoff.routeNo
        ) {
          validPairs.push({
            pickup: { ...pickup, distance: pickupDist },
            dropoff: { ...dropoff, distance: dropoffDist },
          });
        }
      }
    }

    // Process best pair for this route
    if (validPairs.length > 0) {
      let bestPair: { pickup: PointInfo; dropoff: PointInfo } | undefined;
      // Prefer candidate pairs where dropoff is a stop
      const stopCandidates = validPairs.filter(
        (pair) => pair.dropoff.type === "stop"
      );
      if (stopCandidates.length > 0) {
        bestPair = stopCandidates.sort(
          (a, b) =>
            a.pickup.distance! +
            a.dropoff.distance! -
            (b.pickup.distance! + b.dropoff.distance!)
        )[0];
      } else {
        bestPair = validPairs.sort(
          (a, b) =>
            a.pickup.distance! +
            a.dropoff.distance! -
            (b.pickup.distance! + b.dropoff.distance!)
        )[0];
      }

      if (!bestPair) continue;

      const waypointsBetween = route.waypoints
        .filter((w: any) => {
          const startOrder =
            bestPair.pickup.type === "stop"
              ? bestPair.pickup.parentOrder!
              : bestPair.pickup.order;
          const endOrder =
            bestPair.dropoff.type === "stop"
              ? bestPair.dropoff.parentOrder!
              : bestPair.dropoff.order;
          return w.order > startOrder && w.order < endOrder;
        })
        .map((w: any) => ({
          latitude: w.location.lat!,
          longitude: w.location.lng!,
        }));

      // Get direction segments
      const [walkToPickup, jeepneyPath, walkFromDropoff] = await Promise.all([
        getDirections(origin, bestPair.pickup, [], "walking"),
        getDirections(
          bestPair.pickup,
          bestPair.dropoff,
          waypointsBetween,
          "driving"
        ),
        getDirections(bestPair.dropoff, destination, [], "walking"),
      ]);

      if (walkToPickup && jeepneyPath && walkFromDropoff) {
        directRoutes.push({
          route: {
            routeName: route.routeName,
            routeColor: route.routeColor,
            routeNo: route.routeNo,
          },
          duration: jeepneyPath.duration,
          distance: jeepneyPath.distance,
          location: {
            origin: {
              latitude: bestPair.pickup.latitude,
              longitude: bestPair.pickup.longitude,
            },
            destination: {
              latitude: bestPair.dropoff.latitude,
              longitude: bestPair.dropoff.longitude,
            },
          },
          walkingDistances: {
            toPickup: walkToPickup.distance.value,
            fromDropoff: walkFromDropoff.distance.value,
          },
          segments: {
            walkToPickup: {
              polyline: walkToPickup.polyline,
              distance: walkToPickup.distance,
              duration: walkToPickup.duration,
              address: walkToPickup.end_address,
              origin: {
                latitude: origin.latitude,
                longitude: origin.longitude,
              },
              destination: {
                latitude: bestPair.pickup.latitude,
                longitude: bestPair.pickup.longitude,
              },
            },
            jeepneyPath: {
              polyline: jeepneyPath.polyline,
              distance: jeepneyPath.distance,
              duration: jeepneyPath.duration,
              origin: {
                latitude: bestPair.pickup.latitude,
                longitude: bestPair.pickup.longitude,
              },
              destination: {
                latitude: bestPair.dropoff.latitude,
                longitude: bestPair.dropoff.longitude,
              },
              fare_estimation: {
                modernized: {
                  regular: calculateFare(
                    jeepneyPath.distance.value / 1000,
                    "modernized"
                  ),
                  discounted: calculateFare(
                    jeepneyPath.distance.value / 1000,
                    "modernized",
                    true
                  ),
                },
                traditional: {
                  regular: calculateFare(
                    jeepneyPath.distance.value / 1000,
                    "traditional"
                  ),
                  discounted: calculateFare(
                    jeepneyPath.distance.value / 1000,
                    "traditional",
                    true
                  ),
                },
              },
            },
            walkFromDropoff: {
              polyline: walkFromDropoff.polyline,
              distance: walkFromDropoff.distance,
              duration: walkFromDropoff.duration,
              address: walkFromDropoff.start_address,
              origin: {
                latitude: bestPair.dropoff.latitude,
                longitude: bestPair.dropoff.longitude,
              },
              destination: {
                latitude: destination.latitude,
                longitude: destination.longitude,
              },
            },
          },
        });
      }
    }
  }

  const filteredRoutes = directRoutes.filter(
    (route) =>
      route.walkingDistances.toPickup + route.walkingDistances.fromDropoff <=
      MAX_TOTAL_WALKING
  );

  filteredRoutes.sort((a, b) => {
    const aTotal =
      a.walkingDistances.toPickup +
      a.walkingDistances.fromDropoff +
      a.distance.value;
    const bTotal =
      b.walkingDistances.toPickup +
      b.walkingDistances.fromDropoff +
      b.distance.value;
    return aTotal - bTotal;
  });

  if (filteredRoutes.length > 0) {
    return res
      .status(StatusCodes.OK)
      .json({ directRoutes: filteredRoutes, transferRoutes: [] });
  }

  // ---------------------------
  // Transfer route algorithm
  // ---------------------------
  let transferRoutes: TransferRoute[] = [];
  const candidatePairsFirstLeg: {
    route: any;
    pickup: PointInfo;
    dropoff: PointInfo;
  }[] = [];
  const candidatePairsSecondLeg: {
    route: any;
    pickup: PointInfo;
    dropoff: PointInfo;
  }[] = [];

  for (const route of routes as any) {
    const allPoints: PointInfo[] = route.waypoints.flatMap((waypoint: any) => {
      const points: PointInfo[] = [];
      if (waypoint.location?.lat && waypoint.location?.lng) {
        points.push({
          latitude: waypoint.location.lat,
          longitude: waypoint.location.lng,
          order: waypoint.order,
          isOutBound: waypoint.isOutBound,
          type: "waypoint",
          routeNo: route.routeNo,
          name: waypoint.location.name || "",
        });
      }
      return points.concat(
        waypoint.stops
          .filter((stop: any) => stop.location?.lat && stop.location?.lng)
          .map((stop: any) => ({
            latitude: stop.location.lat,
            longitude: stop.location.lng,
            order: stop.order,
            parentOrder: waypoint.order,
            isOutBound: stop.isOutBound,
            type: "stop",
            routeNo: route.routeNo,
            name: stop.name || "",
          }))
      );
    });

    for (const pickup of allPoints) {
      const distanceFromOrigin = haversine(origin, {
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      } as LatLng);
      if (distanceFromOrigin > MAX_WALKING_DISTANCE) continue;

      for (const dropoff of allPoints) {
        const sameDirection = pickup.isOutBound === dropoff.isOutBound;
        const validOrder = pickup.order < dropoff.order;
        if (sameDirection && validOrder && pickup.routeNo === dropoff.routeNo) {
          candidatePairsFirstLeg.push({
            route,
            pickup,
            dropoff,
          });
        }
      }
    }

    for (const pickup of allPoints) {
      for (const dropoff of allPoints) {
        const distanceToDestination = haversine(destination, {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude,
        } as LatLng);
        const sameDirection = pickup.isOutBound === dropoff.isOutBound;
        const validOrder = pickup.order < dropoff.order;
        if (distanceToDestination > MAX_WALKING_DISTANCE) continue;
        if (sameDirection && validOrder && pickup.routeNo === dropoff.routeNo) {
          candidatePairsSecondLeg.push({
            route,
            pickup,
            dropoff,
          });
        }
      }
    }
  }

  const transferCandidates: {
    firstLeg: { route: any; pickup: PointInfo; dropoff: PointInfo };
    secondLeg: { route: any; pickup: PointInfo; dropoff: PointInfo };
    score: number;
  }[] = [];
  for (const firstLeg of candidatePairsFirstLeg) {
    for (const secondLeg of candidatePairsSecondLeg) {
      if (firstLeg.route.routeNo === secondLeg.route.routeNo) continue;

      const transferDistance = haversine(firstLeg.dropoff, {
        latitude: secondLeg.pickup.latitude,
        longitude: secondLeg.pickup.longitude,
      } as LatLng);
      if (transferDistance > MAX_WALKING_DISTANCE) continue;

      const distOriginPickup = haversine(origin, {
        latitude: firstLeg.pickup.latitude,
        longitude: firstLeg.pickup.longitude,
      } as LatLng);
      const distSecondDropoffDestination = haversine(destination, {
        latitude: secondLeg.dropoff.latitude,
        longitude: secondLeg.dropoff.longitude,
      } as LatLng);
      const totalApproxWalking =
        distOriginPickup + transferDistance + distSecondDropoffDestination;

      transferCandidates.push({
        firstLeg,
        secondLeg,
        score: totalApproxWalking,
      });
    }
  }
  transferCandidates.sort((a, b) => a.score - b.score);
  const topCandidates = transferCandidates.slice(0, 2);

  for (const candidate of topCandidates) {
    const { firstLeg, secondLeg } = candidate;

    const firstLegWaypointsBetween = firstLeg.route.waypoints
      .filter((w: any) => {
        const startOrder =
          firstLeg.pickup.type === "stop"
            ? firstLeg.pickup.parentOrder!
            : firstLeg.pickup.order;
        const endOrder =
          firstLeg.dropoff.type === "stop"
            ? firstLeg.dropoff.parentOrder!
            : firstLeg.dropoff.order;
        return w.order > startOrder && w.order < endOrder;
      })
      .map((w: any) => ({
        latitude: w.location.lat!,
        longitude: w.location.lng!,
      }));

    const secondLegWaypointsBetween = secondLeg.route.waypoints
      .filter((w: any) => {
        const startOrder =
          secondLeg.pickup.type === "stop"
            ? secondLeg.pickup.parentOrder!
            : secondLeg.pickup.order;
        const endOrder =
          secondLeg.dropoff.type === "stop"
            ? secondLeg.dropoff.parentOrder!
            : secondLeg.dropoff.order;
        return w.order > startOrder && w.order < endOrder;
      })
      .map((w: any) => ({
        latitude: w.location.lat!,
        longitude: w.location.lng!,
      }));

    // Time the Promise.all call for the directional API on this top candidate
    const promiseStart = Date.now();
    const [
      leg1_walkToPickup,
      leg1_jeepney,
      transfer_walk,
      leg2_jeepney,
      leg2_walkFromDropoff,
    ] = await Promise.all([
      getDirections(origin, firstLeg.pickup, [], "walking"),
      getDirections(
        firstLeg.pickup,
        firstLeg.dropoff,
        firstLegWaypointsBetween,
        "driving"
      ),
      getDirections(firstLeg.dropoff, secondLeg.pickup, [], "walking"),
      getDirections(
        secondLeg.pickup,
        secondLeg.dropoff,
        secondLegWaypointsBetween,
        "driving"
      ),
      getDirections(secondLeg.dropoff, destination, [], "walking"),
    ]);
    const promiseElapsed = Date.now() - promiseStart;

    if (
      leg1_walkToPickup &&
      leg1_jeepney &&
      transfer_walk &&
      leg2_jeepney &&
      leg2_walkFromDropoff
    ) {
      const overallDurationValue =
        leg1_walkToPickup.duration.value +
        leg1_jeepney.duration.value +
        transfer_walk.duration.value +
        leg2_jeepney.duration.value +
        leg2_walkFromDropoff.duration.value;
      const overallDistanceValue =
        leg1_walkToPickup.distance.value +
        leg1_jeepney.distance.value +
        transfer_walk.distance.value +
        leg2_jeepney.distance.value +
        leg2_walkFromDropoff.distance.value;

      const leg1FareModernized = {
        regular: calculateFare(
          leg1_jeepney.distance.value / 1000,
          "modernized"
        ),
        discounted: calculateFare(
          leg1_jeepney.distance.value / 1000,
          "modernized",
          true
        ),
      };
      const leg1FareTraditional = {
        regular: calculateFare(
          leg1_jeepney.distance.value / 1000,
          "traditional"
        ),
        discounted: calculateFare(
          leg1_jeepney.distance.value / 1000,
          "traditional",
          true
        ),
      };
      const leg2FareModernized = {
        regular: calculateFare(
          leg2_jeepney.distance.value / 1000,
          "modernized"
        ),
        discounted: calculateFare(
          leg2_jeepney.distance.value / 1000,
          "modernized",
          true
        ),
      };
      const leg2FareTraditional = {
        regular: calculateFare(
          leg2_jeepney.distance.value / 1000,
          "traditional"
        ),
        discounted: calculateFare(
          leg2_jeepney.distance.value / 1000,
          "traditional",
          true
        ),
      };

      const totalWalkingDistanceVal =
        leg1_walkToPickup.distance.value +
        transfer_walk.distance.value +
        leg2_walkFromDropoff.distance.value;

      transferRoutes.push({
        routes: [
          {
            routeNo: firstLeg.route.routeNo,
            routeName: firstLeg.route.routeName,
            routeColor: firstLeg.route.routeColor,
            transferPoint: {
              location: {
                lat: firstLeg.dropoff.latitude,
                lng: firstLeg.dropoff.longitude,
              },
              name: firstLeg.dropoff.name || "",
            },
          },
          {
            routeNo: secondLeg.route.routeNo,
            routeName: secondLeg.route.routeName,
            routeColor: secondLeg.route.routeColor,
            transferPoint: {
              location: {
                lat: secondLeg.pickup.latitude,
                lng: secondLeg.pickup.longitude,
              },
              name: secondLeg.pickup.name || "",
            },
          },
        ],
        segments: {
          walkToPickup: {
            polyline: leg1_walkToPickup.polyline,
            distance: leg1_walkToPickup.distance,
            duration: leg1_walkToPickup.duration,
            address: leg1_walkToPickup.end_address,
            origin: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
            destination: {
              latitude: firstLeg.pickup.latitude,
              longitude: firstLeg.pickup.longitude,
            },
          },
          firstJeepney: {
            polyline: leg1_jeepney.polyline,
            distance: leg1_jeepney.distance,
            duration: leg1_jeepney.duration,
            fare_estimation: {
              modernized: leg1FareModernized,
              traditional: leg1FareTraditional,
            },
            origin: {
              latitude: firstLeg.pickup.latitude,
              longitude: firstLeg.pickup.longitude,
            },
            destination: {
              latitude: firstLeg.dropoff.latitude,
              longitude: firstLeg.dropoff.longitude,
            },
          },
          transferWalk: {
            polyline: transfer_walk.polyline,
            distance: transfer_walk.distance,
            duration: transfer_walk.duration,
            address: transfer_walk.start_address,
            origin: {
              latitude: firstLeg.dropoff.latitude,
              longitude: firstLeg.dropoff.longitude,
            },
            destination: {
              latitude: secondLeg.pickup.latitude,
              longitude: secondLeg.pickup.longitude,
            },
          },
          secondJeepney: {
            polyline: leg2_jeepney.polyline,
            distance: leg2_jeepney.distance,
            duration: leg2_jeepney.duration,
            fare_estimation: {
              modernized: leg2FareModernized,
              traditional: leg2FareTraditional,
            },
            origin: {
              latitude: secondLeg.pickup.latitude,
              longitude: secondLeg.pickup.longitude,
            },
            destination: {
              latitude: secondLeg.dropoff.latitude,
              longitude: secondLeg.dropoff.longitude,
            },
          },
          walkFromDropoff: {
            polyline: leg2_walkFromDropoff.polyline,
            distance: leg2_walkFromDropoff.distance,
            duration: leg2_walkFromDropoff.duration,
            address: leg2_walkFromDropoff.start_address,
            origin: {
              latitude: secondLeg.dropoff.latitude,
              longitude: secondLeg.dropoff.longitude,
            },
            destination: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        totalDuration: {
          text: `${Math.round(overallDurationValue / 60)} mins`,
          value: overallDurationValue,
        },
        totalDistance: {
          text: `${(overallDistanceValue / 1000).toFixed(1)} km`,
          value: overallDistanceValue,
        },
        totalWalkingDistance: {
          text: `${totalWalkingDistanceVal}m`,
          value: totalWalkingDistanceVal,
        },
        totalFare: {
          modernized: {
            regular: +(
              leg1FareModernized.regular + leg2FareModernized.regular
            ).toFixed(1),
            discounted: +(
              leg1FareModernized.discounted + leg2FareModernized.discounted
            ).toFixed(2),
          },
          traditional: {
            regular: +(
              leg1FareTraditional.regular + leg2FareTraditional.regular
            ).toFixed(1),
            discounted: +(
              leg1FareTraditional.discounted + leg2FareTraditional.discounted
            ).toFixed(2),
          },
        },
      });
    }
  }

  transferRoutes.sort((a, b) => a.totalDuration.value - b.totalDuration.value);
  transferRoutes = transferRoutes.slice(0, 2);
  return res.status(StatusCodes.OK).json({ directRoutes: [], transferRoutes });
};
