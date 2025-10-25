
import React from 'react';

interface InputWithIconProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  id: string;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({ icon, type, placeholder, id }) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-gray-800 focus-within:border-transparent transition-all duration-300">
      <span className="pl-4 pr-3 text-gray-400">
        {icon}
      </span>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        className="w-full py-3 pr-4 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
      />
    </div>
  );
};

export default InputWithIcon;
