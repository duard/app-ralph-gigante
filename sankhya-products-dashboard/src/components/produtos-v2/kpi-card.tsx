import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ProductDataPreloader } from '@/lib/product-data-preloader';
import { useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  trend?: {
    value: number; // Percentual de variação
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-l-4 border-l-green-500',
  warning: 'border-l-4 border-l-yellow-500',
  danger: 'border-l-4 border-l-red-500',
  info: 'border-l-4 border-l-blue-500',
};

export function KpiCard({
  title,
  value,
  icon,
  href,
  onClick,
  loading = false,
  className,
  trend,
  variant = 'default',
}: KpiCardProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (href && linkRef.current) {
      // Set up prefetching based on the href
      if (href.startsWith('/produtos-v2/grupo/')) {
        const codgrupoprod = parseInt(href.split('/').pop() || '0', 10);
        if (codgrupoprod) {
          ProductDataPreloader.prefetchOnHover(linkRef.current, `group-${codgrupoprod}`, () =>
            ProductDataPreloader.preloadGroupSummary(codgrupoprod)
          );
        }
      } else if (href.startsWith('/produtos-v2/local/')) {
        const codlocal = parseInt(href.split('/').pop() || '0', 10);
        if (codlocal) {
          ProductDataPreloader.prefetchOnHover(linkRef.current, `local-${codlocal}`, () =>
            ProductDataPreloader.preloadLocalSummary(codlocal)
          );
        }
      }
    }
  }, [href]);

  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '—' : value}</div>
        {trend && !loading && (
          <div className="flex items-center gap-1 text-xs mt-1">
            {trend.isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span className={cn(trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">vs período anterior</span>
          </div>
        )}
      </CardContent>
    </>
  );

  const cardClasses = cn('hover:shadow-md transition-shadow', variantStyles[variant], className);

  if (href) {
    return (
      <Link to={href} ref={linkRef}>
        <Card className={cardClasses}>{cardContent}</Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Card className={cn(cardClasses, 'cursor-pointer')} onClick={onClick}>
        {cardContent}
      </Card>
    );
  }

  return <Card className={cardClasses}>{cardContent}</Card>;
}
