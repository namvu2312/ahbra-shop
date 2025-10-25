import React from 'react';

interface SocialButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, text, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50 transition-colors duration-300"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default SocialButton;