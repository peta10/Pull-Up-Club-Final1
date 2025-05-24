import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children, className = '', ...props }) => {
  // Base styles
  const baseStyles = 'transition-colors duration-200';
  
  // Combine base styles with any additional classes
  const combinedStyles = `${baseStyles} ${className}`;
  
  return (
    <a href={href} className={combinedStyles} {...props}>
      {children}
    </a>
  );
};