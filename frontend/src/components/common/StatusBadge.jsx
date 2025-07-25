import { statusColors } from "../../utils/colors";

export const StatusBadge = ({ status, size = "md", className = "" }) => {
  // const statusColors = {
  //   pending: {
  //     bg: 'bg-warning-base/10 dark:bg-warning-base/20',
  //     text: 'text-warning-base dark:text-warning-hover',
  //     border: 'border-warning-base/30 dark:border-warning-base/40'
  //   },
  //   accepted: {
  //     bg: 'bg-success-base/10 dark:bg-success-base/20',
  //     text: 'text-success-base dark:text-green-200',
  //     border: 'border-success-base/30 dark:border-success-base/40'
  //   },
  //   rejected: {
  //     bg: 'bg-error-base/10 dark:bg-error-base/20',
  //     text: 'text-error-base dark:text-error-hover',
  //     border: 'border-error-base/30 dark:border-error-base/40'
  //   },
  //   assigned: {
  //     bg: 'bg-primary-light/10 dark:bg-primary-dark/20',
  //     text: 'text-primary-light dark:text-primary-dark',
  //     border: 'border-primary-light/30 dark:border-primary-dark/40'
  //   },
  //   'in-progress': {
  //     bg: 'bg-warning-base/10 dark:bg-warning-base/20',
  //     text: 'text-warning-base dark:text-warning-hover',
  //     border: 'border-warning-base/30 dark:border-warning-base/40'
  //   },
  //   completed: {
  //     bg: 'bg-success-base/10 dark:bg-success-base/20',
  //     text: 'text-success-base dark:text-green-200',
  //     border: 'border-success-base/30 dark:border-success-base/40'
  //   },
  //   cancelled: {
  //     bg: 'bg-error-base/10 dark:bg-error-base/20',
  //     text: 'text-error-base dark:text-error-hover',
  //     border: 'border-error-base/30 dark:border-error-base/40'
  //   },
  //   default: {
  //     bg: 'bg-secondary-light/10 dark:bg-secondary-dark/20',
  //     text: 'text-secondary-light dark:text-text-secondaryDark',
  //     border: 'border-secondary-light/30 dark:border-secondary-dark/40'
  //   }
  // };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-sm font-medium",
    lg: "px-3 py-1.5 text-base font-medium",
  };

  const colors = statusColors[status] || statusColors.default;
  // console.log("StatusBadge rendered with status:", colors);

  return (
    <span
      className={`
        inline-flex items-center justify-center capitalize rounded-full
        ${colors.bg}
        ${colors.text}
        ${colors.border}
        ${sizeClasses[size]}
        ${className}
        transition-colors duration-200
      `}
    >
      {status}
    </span>
  );
};
