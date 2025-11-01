import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "text-primary",
  subtitle 
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-[#1e293b] border-[#334155]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#f1f5f9]">
          {title}
        </CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#f1f5f9]">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${
            isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
          }`}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
