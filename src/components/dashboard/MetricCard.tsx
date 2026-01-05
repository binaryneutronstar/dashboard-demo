import { TrendingUp, TrendingDown, Users, UserPlus, Target } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { formatPercent } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: string
}

const iconMap = {
  trendingUp: TrendingUp,
  users: Users,
  userPlus: UserPlus,
  target: Target,
}

export function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] || TrendingUp
  const isPositive = change > 0

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercent(change)}
            </span>
            <span className="text-sm text-gray-500 ml-1">前月比</span>
          </div>
        </div>
        <div className="rounded-full bg-blue-50 p-3">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  )
}
