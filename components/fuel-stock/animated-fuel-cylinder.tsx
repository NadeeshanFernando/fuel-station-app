'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AlertTriangle, Droplets } from 'lucide-react'

interface AnimatedFuelCylinderProps {
  fuelName: string
  currentStock: number
  capacity: number
  minAlert: number
  color: string
  unit?: string
  className?: string
}

export function AnimatedFuelCylinder({
  fuelName,
  currentStock,
  capacity,
  minAlert,
  color,
  unit = 'L',
  className,
}: AnimatedFuelCylinderProps) {
  const percentage = Math.min((currentStock / capacity) * 100, 100)
  const alertPercentage = (minAlert / capacity) * 100

  // Determine status
  const getStatus = () => {
    if (currentStock <= minAlert) return 'critical'
    if (currentStock <= minAlert * 1.5) return 'low'
    if (currentStock >= capacity * 0.9) return 'high'
    return 'normal'
  }

  const status = getStatus()

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-600'
      case 'low':
        return 'text-orange-500'
      case 'high':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  const getStatusBg = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'low':
        return 'bg-orange-50 border-orange-200'
      case 'high':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={cn('rounded-lg border-2 p-4', getStatusBg(), className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className={cn('h-5 w-5', getStatusColor())} />
          <h3 className="font-semibold text-lg">{fuelName}</h3>
        </div>
        {status === 'critical' && (
          <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
        )}
      </div>

      {/* Cylinder Container */}
      <div className="relative">
        {/* 3D Cylinder Top */}
        <div className="relative h-8 mb-1">
          <svg viewBox="0 0 200 40" className="w-full h-full">
            <ellipse
              cx="100"
              cy="20"
              rx="90"
              ry="15"
              fill={color}
              opacity="0.3"
            />
            <ellipse
              cx="100"
              cy="20"
              rx="90"
              ry="15"
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Cylinder Body */}
        <div
          className="relative rounded-b-3xl overflow-hidden border-2"
          style={{
            height: '250px',
            borderColor: color,
            backgroundColor: '#f9fafb',
          }}
        >
          {/* Alert Line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400 z-10"
            style={{
              bottom: `${alertPercentage}%`,
            }}
          >
            <span className="absolute -right-2 -top-3 text-xs bg-orange-100 px-1 rounded text-orange-700">
              Alert
            </span>
          </div>

          {/* Fuel Level Animation */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{
              duration: 1.5,
              delay: 0.2,
              ease: 'easeOut',
            }}
            className="absolute bottom-0 left-0 right-0 rounded-b-3xl"
            style={{
              backgroundColor: color,
              opacity: 0.7,
            }}
          >
            {/* Animated Waves */}
            <div className="absolute inset-x-0 top-0 h-8">
              <motion.div
                animate={{
                  x: [-20, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0"
              >
                <svg
                  viewBox="0 0 200 20"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 10 Q 10 5, 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 T 140 10 T 160 10 T 180 10 T 200 10 L 200 20 L 0 20 Z"
                    fill="white"
                    opacity="0.3"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Shine Effect */}
            <motion.div
              animate={{
                y: [-300, 300],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            />
          </motion.div>

          {/* Percentage Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className={cn(
                'text-4xl font-bold drop-shadow-lg',
                percentage < 50 ? 'text-gray-700' : 'text-white'
              )}
            >
              {percentage.toFixed(1)}%
            </motion.div>
          </div>

          {/* Gradation Lines */}
          {[25, 50, 75].map((line) => (
            <div
              key={line}
              className="absolute left-0 right-0 border-t border-gray-300"
              style={{ bottom: `${line}%` }}
            >
              <span className="absolute -left-8 -top-2 text-xs text-gray-500">
                {Math.round((capacity * line) / 100)}
              </span>
            </div>
          ))}
        </div>

        {/* Cylinder Bottom Shadow */}
        <div className="h-2 mt-1">
          <svg viewBox="0 0 200 10" className="w-full h-full">
            <ellipse
              cx="100"
              cy="5"
              rx="90"
              ry="5"
              fill="black"
              opacity="0.1"
            />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Stock:</span>
          <span className={cn('font-bold', getStatusColor())}>
            {currentStock.toFixed(2)} {unit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Capacity:</span>
          <span className="font-medium">
            {capacity.toFixed(2)} {unit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Alert:</span>
          <span className="font-medium">
            {minAlert.toFixed(2)} {unit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Available:</span>
          <span className="font-medium">
            {(capacity - currentStock).toFixed(2)} {unit}
          </span>
        </div>
        <div className="pt-2 border-t">
          <span
            className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
              status === 'critical'
                ? 'bg-red-100 text-red-700'
                : status === 'low'
                ? 'bg-orange-100 text-orange-700'
                : status === 'high'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            )}
          >
            {status} Level
          </span>
        </div>
      </div>
    </div>
  )
}
