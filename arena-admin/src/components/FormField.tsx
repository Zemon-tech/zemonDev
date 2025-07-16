import type { InputHTMLAttributes, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  name: string;
  label: string;
  type?: 'text' | 'select' | 'textarea' | 'checkbox' | 'number';
  error?: string;
  children?: ReactNode;
  rows?: number;
}

const FormField = ({
  name,
  label,
  type = 'text',
  error,
  children,
  rows = 3,
  ...rest
}: FormFieldProps) => {
  const { register } = useFormContext();

  // Render different input types
  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            {...register(name)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...rest}
          >
            {children}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            id={name}
            {...register(name)}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...rest as any}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              {...register(name)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              {...rest}
            />
            <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
              {label}
            </label>
          </div>
        );
      default:
        return (
          <input
            type={type}
            id={name}
            {...register(name)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...rest}
          />
        );
    }
  };

  // For checkbox, we only need the input and label
  if (type === 'checkbox') {
    return renderField();
  }

  // For other field types, we need a label and the input
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {renderField()}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField; 