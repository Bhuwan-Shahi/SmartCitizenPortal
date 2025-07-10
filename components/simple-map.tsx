"use client"

import { useRef } from "react"
import { MapPin } from "lucide-react"

interface SimpleMapProps {
  latitude: number
  longitude: number
  markers?: Array<{
    lat: number
    lng: number
    title: string
    color?: string
  }>
  className?: string
}

export function SimpleMap({ latitude, longitude, markers = [], className = "" }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // This is a simplified map representation
  // In production, you'd use Google Maps, Mapbox, or similar
  return (
    <div
      ref={mapRef}
      className={`relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: "200px" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{markers.length > 0 && `${markers.length} nearby issues`}</p>
        </div>
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>

      {/* Show nearby markers */}
      {markers.map((marker, index) => (
        <div
          key={index}
          className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${20 + ((index * 15) % 60)}%`,
            top: `${30 + ((index * 10) % 40)}%`,
          }}
          title={marker.title}
        />
      ))}
    </div>
  )
}
