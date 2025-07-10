export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    // Using a free geocoding service (you might want to use Google Maps API or similar in production)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data = await response.json()

    // Format the address
    const parts = []
    if (data.locality) parts.push(data.locality)
    if (data.principalSubdivision) parts.push(data.principalSubdivision)
    if (data.countryName) parts.push(data.countryName)

    return parts.join(", ") || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}
