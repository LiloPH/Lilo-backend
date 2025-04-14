const calculateFare = (
  distanceKm: number,
  type: "traditional" | "modernized",
  discounted = false
) => {
  const baseDistance = 4; // Base distance in kilometers

  // Fares for traditional jeepneys
  const traditionalFares = {
    baseFare: 12,
    additionalFarePerKm: 1.8,
    discountedBaseFare: 9.6,
    discountedAdditionalFarePerKm: 1.44,
  };

  // Fares for modernized jeepneys
  const modernizedFares = {
    baseFare: 14,
    additionalFarePerKm: 2.2,
    discountedBaseFare: 11.25,
    discountedAdditionalFarePerKm: 1.76,
  };

  let fares;

  if (type === "traditional") {
    fares = traditionalFares;
  } else if (type === "modernized") {
    fares = modernizedFares;
  } else {
    throw new Error("Unknown jeepney type");
  }

  let baseFare = discounted ? fares.discountedBaseFare : fares.baseFare;
  let additionalFarePerKm = discounted
    ? fares.discountedAdditionalFarePerKm
    : fares.additionalFarePerKm;

  let totalFare;
  if (distanceKm <= baseDistance) {
    totalFare = baseFare;
  } else {
    const additionalDistance = distanceKm - baseDistance;
    const additionalFare = Math.ceil(additionalDistance) * additionalFarePerKm;
    totalFare = baseFare + additionalFare;
  }

  return Math.round(totalFare * 100) / 100; // Round off to 2 decimal places
};

export { calculateFare };
