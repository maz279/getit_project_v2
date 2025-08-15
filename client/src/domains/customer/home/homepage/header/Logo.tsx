
import React from 'react';
import { Logo as LogoComponent } from './logo/Logo';

interface LogoProps {
  language: string;
}

export const Logo: React.FC<LogoProps> = ({ language }) => {
  return <LogoComponent language={language} />;
};
