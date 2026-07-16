import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-1 text-sm font-semibold leading-none w-fit",
  {
    variants: {
      variant: {
        recruiting: "bg-brand-primary text-blue-100",
        admission_closing: "bg-brand-secondary text-black-400",
        closed: "bg-gray-200 text-blue-100",
      },
    },
    defaultVariants: {
      variant: "recruiting",
    },
  },
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

function Badge({ variant, children }: BadgeProps) {
  return <span className={badgeVariants({ variant })}>{children}</span>;
}

export default Badge;
