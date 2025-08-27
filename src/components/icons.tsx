import type { SVGProps } from "react";

export function NurseFinAILogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 22" />
      <path d="M17 7H7" />
      <path d="M12 2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4" />
      <path d="M12 2a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
