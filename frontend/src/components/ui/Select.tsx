import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = '', children, ...rest }, ref
) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});

export default Select;
