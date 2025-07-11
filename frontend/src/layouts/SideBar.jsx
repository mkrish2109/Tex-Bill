import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiChartPie,
  HiUser,
  HiShoppingBag,
  HiChevronDown,
  HiOutlineDotsHorizontal,
  HiDocumentText,
  HiOutlineViewGridAdd,
} from "react-icons/hi";
import { FaUsersCog, FaTools } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdWork } from "react-icons/md";
import { useSelector } from "react-redux";
import { useSidebar } from "../contexts/SidebarContext";
import { Logo } from "../components/common/Logo";

// Lazy load menu configurations
const menuConfigurations = {
  admin: {
    mainItems: [
      {
        name: "Dashboard",
        icon: <HiChartPie className="text-xl" />,
        path: "/admin/dashboard",
      },
      {
        name: "Users",
        icon: <FaUsersCog className="text-xl" />,
        subItems: [
          { name: "All Users", path: "/admin/users" },
          { name: "Roles", path: "/admin/roles" },
          { name: "Permissions", path: "/admin/permissions" },
        ],
      },
      {
        name: "Account",
        icon: <HiUser className="text-xl" />,
        subItems: [
          { name: "Profile", path: "/admin/account/profile" },
          { name: "Settings", path: "/account/settings" },
        ],
      },
    ],
    otherItems: [
      {
        name: "Products",
        icon: <HiShoppingBag className="text-xl" />,
        subItems: [
          { name: "All Products", path: "/admin/products" },
          { name: "Categories", path: "/admin/categories" },
        ],
      },
      {
        name: "Logout",
        icon: <IoLogOut className="text-xl" />,
        path: "/logout",
      },
    ],
  },
  worker: {
    mainItems: [
      {
        name: "Dashboard",
        icon: <HiChartPie className="text-xl" />,
        path: "/worker/dashboard",
      },
      {
        name: "Requests",
        icon: <FaUsersCog className="text-xl" />,
        subItems: [
          { name: "View Requests", path: "/worker/requests" },
          { name: "My Connections", path: "/worker/connections" },
        ],
      },
      {
        name: "Tasks",
        icon: <MdWork className="text-xl" />,
        path: "/worker/tasks",
      },
      {
        name: "Account",
        icon: <HiUser className="text-xl" />,
        subItems: [
          { name: "Profile", path: "/worker/account/profile" },
          { name: "Settings", path: "/account/settings" },
        ],
      },
    ],
    otherItems: [
      {
        name: "Tools",
        icon: <FaTools className="text-xl" />,
        path: "/worker/tools",
      },
      {
        name: "Logout",
        icon: <IoLogOut className="text-xl" />,
        path: "/logout",
      },
    ],
  },
  buyer: {
    mainItems: [
      {
        name: "Dashboard",
        icon: <HiChartPie className="text-xl" />,
        path: "/buyer/dashboard",
      },
      {
        name: "Network",
        icon: <FaUsersCog className="text-xl" />,
        subItems: [
          { name: "Find Workers", path: "/buyer/network" },
          { name: "My Requests", path: "/buyer/requests" },
          { name: "My Connections", path: "/buyer/connections" },
        ],
      },
      {
        name: "Fabric",
        icon: <HiOutlineViewGridAdd className="text-xl" />,
        subItems: [
          { name: "All Fabric", path: "/buyer/fabrics" },
          { name: "Add Fabric", path: "/buyer/fabrics/add" },
        ],
      },
      {
        name: "Account",
        icon: <HiUser className="text-xl" />,
        subItems: [
          { name: "Profile", path: "/buyer/account/profile" },
          { name: "Settings", path: "/account/settings" },
        ],
      },
    ],
    otherItems: [
      {
        name: "Documents",
        icon: <HiDocumentText className="text-xl" />,
        path: "/buyer/documents",
      },
      {
        name: "Logout",
        icon: <IoLogOut className="text-xl" />,
        path: "/logout",
      },
    ],
  },
};

function Sidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const subMenuRefs = useRef({});
  const { user } = useSelector((state) => state.user);
  const role = user?.role || "buyer"; // Default to buyer if no role

  const { mainItems, otherItems } =
    menuConfigurations[role] || menuConfigurations.buyer;

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest("aside")) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen, setIsMobileOpen]);

  // Auto-expand submenu for current path
  useEffect(() => {
    let submenuMatched = false;

    ["main", "other"].forEach((menuType) => {
      const items = menuType === "main" ? mainItems : otherItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        } else if (nav.path && isActive(nav.path)) {
          submenuMatched = true;
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, isActive, mainItems, otherItems]);

  const toggleSubmenu = (index, menuType, hasSubItems) => {
    setOpenSubmenu((prev) => {
      // If clicking the same item that's already open, close it
      if (prev?.type === menuType && prev.index === index) {
        return null;
      }
      // If clicking an item with subitems, open it
      if (hasSubItems) {
        return { type: menuType, index };
      }
      // Otherwise (clicking a main item without subitems), close any open submenu
      return null;
    });
  };

  const getSubmenuHeight = (menuType, index) => {
    const key = `${menuType}-${index}`;
    return subMenuRefs.current[key]?.scrollHeight || 0;
  };

  const renderNavItem = (item, index, menuType) => {
    const isSubmenuOpen =
      openSubmenu?.type === menuType && openSubmenu?.index === index;
    const hasActiveSubItem = item.subItems?.some((sub) => isActive(sub.path));
    const isItemActive = isActive(item.path || "") || hasActiveSubItem;

    return (
      <li key={`${menuType}-${index}`}>
        {item.subItems ? (
          <button
            onClick={() => toggleSubmenu(index, menuType, true)}
            className={`flex items-center w-full p-2 rounded-lg transition-colors group ${
              isSubmenuOpen || hasActiveSubItem
                ? "bg-primary-light dark:bg-primary-dark/10 text-white dark:text-primary-dark"
                : "hover:bg-background-surfaceLight dark:hover:bg-background-surfaceDark/50 text-text-light dark:text-text-dark"
            } ${
              isExpanded || isHovered || isMobileOpen
                ? "justify-start"
                : "justify-center"
            }`}
          >
            <span
              className={`${
                isSubmenuOpen || hasActiveSubItem
                  ? "text-white dark:text-primary-dark"
                  : "group-hover:text-primary-light dark:group-hover:text-primary-dark"
              }`}
            >
              {item.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <>
                <span className="ml-3">{item.name}</span>
                <HiChevronDown
                  className={`ml-auto transition-transform duration-200 ${
                    isSubmenuOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>
        ) : (
          item.path && (
            <Link
              to={item.path}
              onClick={() => toggleSubmenu(index, menuType, false)}
              className={`flex items-center w-full p-2 rounded-lg transition-colors group ${
                isItemActive
                  ? "bg-primary-light dark:bg-primary-dark/10 text-white dark:text-primary-dark"
                  : "hover:bg-background-surfaceLight dark:hover:bg-background-surfaceDark/50 text-text-light dark:text-text-dark"
              } ${
                isExpanded || isHovered || isMobileOpen
                  ? "justify-start"
                  : "justify-center"
              }`}
            >
              <span
                className={`${
                  isItemActive
                    ? "text-white dark:text-primary-dark"
                    : "group-hover:text-primary-light dark:group-hover:text-primary-dark"
                }`}
              >
                {item.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </Link>
          )
        )}

        {item.subItems && (isExpanded || isHovered || isMobileOpen) && (
          <div
            ref={(el) => (subMenuRefs.current[`${menuType}-${index}`] = el)}
            className="overflow-hidden transition-all duration-300"
            style={{
              height: isSubmenuOpen
                ? `${getSubmenuHeight(menuType, index)}px`
                : "0px",
            }}
          >
            <ul className="py-1 pl-11 space-y-1">
              {item.subItems.map((subItem, subIndex) => (
                <li key={`${menuType}-${index}-${subIndex}`}>
                  <Link
                    to={subItem.path}
                    className={`block px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      isActive(subItem.path)
                        ? "bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark font-medium"
                        : "hover:bg-background-surfaceLight dark:hover:bg-background-surfaceDark/50 text-text-light dark:text-text-dark"
                    }`}
                  >
                    {subItem.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-background-light dark:bg-background-dark dark:border-border-dark text-text-light dark:text-text-dark h-screen transition-all duration-300 ease-in-out z-50 border-r border-border-light 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full py-4">
        <div className="px-0 mb-6">
          <Link
            to="/"
            className={`flex items-center ${
              isExpanded || isHovered || isMobileOpen ? "" : "justify-center"
            }`}
            aria-label="Home"
          >
            {isExpanded || isHovered || isMobileOpen ? (
              <Logo variant="full" size="lg" />
            ) : (
              <Logo variant="icon" size="lg" />
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="mb-6">
            <h2 className="mb-2 text-xs uppercase text-text-mutedLight dark:text-text-mutedDark flex justify-start px-2">
              {isExpanded || isHovered || isMobileOpen ? (
                "Main Menu"
              ) : (
                <HiOutlineDotsHorizontal className="text-lg" />
              )}
            </h2>
            <ul className="space-y-1">
              {mainItems.map((item, index) =>
                renderNavItem(item, index, "main")
              )}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xs uppercase text-text-mutedLight dark:text-text-mutedDark flex justify-start px-2">
              {isExpanded || isHovered || isMobileOpen ? (
                "Others"
              ) : (
                <HiOutlineDotsHorizontal className="text-lg" />
              )}
            </h2>
            <ul className="space-y-1">
              {otherItems.map((item, index) =>
                renderNavItem(item, index, "other")
              )}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;