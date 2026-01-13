import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
          {index === items.length - 1 ? (
            <span className="text-foreground">{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
