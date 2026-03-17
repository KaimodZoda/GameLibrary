interface InputProps {
  type?: 'text' | 'email' | 'password' | 'date' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  disabled = false,
  className = ''
}: InputProps) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';
  const stateClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const classes = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={classes}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
