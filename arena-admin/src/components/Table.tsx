import type { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
}: TableProps<T>) {
  // Render table headers
  const renderHeaders = () => {
    return (
      <tr>
        {columns.map((column, index) => (
          <th
            key={`header-${index}`}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
          >
            {column.header}
          </th>
        ))}
      </tr>
    );
  };

  // Render table rows
  const renderRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
          >
            Loading...
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
          >
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return data.map((item) => (
      <tr
        key={keyExtractor(item)}
        className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => onRowClick && onRowClick(item)}
      >
        {columns.map((column, colIndex) => (
          <td
            key={`cell-${keyExtractor(item)}-${colIndex}`}
            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.className || ''}`}
          >
            {typeof column.accessor === 'function'
              ? column.accessor(item)
              : item[column.accessor] as ReactNode}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">{renderHeaders()}</thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table; 