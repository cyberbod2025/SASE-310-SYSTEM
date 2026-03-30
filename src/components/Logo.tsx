import React from "react";
import logo from "../assets/logo.svg";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ className, alt = "SASE" }) => {
  return <img src={logo} alt={alt} className={className} />;
};
