export const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`py-2 sm:py-3 px-3 sm:px-6 min-w-[120px] text-center border-b-2 font-medium text-sm sm:text-base md:text-lg flex items-center justify-center transition-all duration-200 relative whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
      active
        ? "border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark bg-primary-light/5 dark:bg-primary-dark/5"
        : "border-transparent text-secondary-light dark:text-text-secondaryDark hover:text-text-light dark:hover:text-text-dark hover:border-border-light dark:hover:border-border-dark hover:bg-background-surfaceLight/50 dark:hover:bg-background-surfaceDark/50"
    }`}
  >
    <Icon
      className={`mr-2 flex-shrink-0 ${
        active
          ? "text-primary-light dark:text-primary-dark"
          : "text-secondary-light dark:text-text-secondaryDark"
      }`}
    />
    <span className="truncate">{children}</span>
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark transform scale-x-100 transition-transform duration-200" />
    )}
  </button>
);
