import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ProductDataPreloader } from '@/lib/product-data-preloader';
import { useEffect, useRef } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  href?: string;
  loading?: boolean;
  className?: string;
}

export function KpiCard({ title, value, icon, href, loading = false, className }: KpiCardProps) {
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
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link to={href} ref={linkRef}>
        <Card className={cn('hover:shadow-md transition-shadow', className)}>{cardContent}</Card>
      </Link>
    );
  }

  return <Card className={className}>{cardContent}</Card>;
}
