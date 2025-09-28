import { SVGProps } from "react";

const BarberPoleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 20.999h-2.909l-2.728-6.999h-2.727l-2.728 7h-2.909l-2.728-7h-2.727L2 21" />
    <path d="M22 2.999h-2.909l-2.728 7h-2.727l-2.728-7h-2.909l-2.728 7h-2.727L2 3" />
    <path d="M12 2.999V21" />
    <path d="M3 3h18" />
    <path d="M3 21h18" />
  </svg>
);

export default BarberPoleIcon;
