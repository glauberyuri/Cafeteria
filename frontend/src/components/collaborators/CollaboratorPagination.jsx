import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollaborators } from '@/contexts/CollaboratorContext';

export function CollaboratorPagination() {
  const {
    page,
    totalPages,
    pageSize,
    totalItems,
    setPage,
  } = useCollaborators();

  if (totalPages <= 1) return null;

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* INFO */}
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground">{startIndex}</span> a{' '}
        <span className="font-medium text-foreground">{endIndex}</span> de{' '}
        <span className="font-medium text-foreground">{totalItems}</span>{' '}
        registros
      </p>

      {/* CONTROLS */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setPage(page - 1)}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="icon"
              className="h-9 w-9"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setPage(page + 1)}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
