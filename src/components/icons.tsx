import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Decorative stroke icon, sized by the surrounding font-size. */
function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const PencilIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export const MoreIcon = (props: IconProps) => (
  <Icon {...props} strokeWidth={2.5}>
    <path d="M5 12h.01M12 12h.01M19 12h.01" />
  </Icon>
);

/** A row of `count` cards, drawn as solid bars: the glyph for an N-per-row layout. */
export function ColumnsIcon({ count, ...props }: IconProps & { count: number }) {
  const span = 16;
  const gap = 2;
  const width = (span - gap * (count - 1)) / count;

  return (
    <svg
      viewBox="0 0 20 20"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <rect
          key={index}
          x={2 + index * (width + gap)}
          y={4}
          width={width}
          height={12}
          rx={Math.min(1.75, width / 2)}
        />
      ))}
    </svg>
  );
}

export const HourglassIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 22h14M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </Icon>
);
