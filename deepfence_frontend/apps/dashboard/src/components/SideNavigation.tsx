import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import classNames from 'classnames';
import { forwardRef, ReactNode, useEffect } from 'react';
import { IconContext, IconType } from 'react-icons';
import { HiChartPie } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from 'ui-components';

export interface SideNavigationRootProps {
  expanded?: boolean;
}

const MenuItems: Array<{
  title: string;
  Icon: IconType;
  to: string;
}> = [
  {
    title: 'Dashboard',
    Icon: HiChartPie,
    to: '/dashboard',
  },
  {
    title: 'Topology',
    Icon: HiChartPie,
    to: '/topology',
  },
  {
    title: 'Threat Graph',
    Icon: HiChartPie,
    to: '/threatgraph',
  },
  {
    title: 'Vulnerability',
    Icon: HiChartPie,
    to: '/vulnerability',
  },
  {
    title: 'Secrets',
    Icon: HiChartPie,
    to: '/secrets',
  },
  {
    title: 'Malware',
    Icon: HiChartPie,
    to: '/malware',
  },
  {
    title: 'Registries',
    Icon: HiChartPie,
    to: '/registries',
  },
  {
    title: 'Integrations',
    Icon: HiChartPie,
    to: '/integrations',
  },
  {
    title: 'Settings',
    Icon: HiChartPie,
    to: '/settings',
  },
];

const ItemWrapper = forwardRef(
  (
    {
      expanded,
      title,
      children,
    }: {
      expanded?: boolean;
      title: string;
      children: ReactNode;
    },
    _,
  ) => {
    if (expanded) return <div>{children}</div>;
    return (
      <Tooltip placement="right" content={title} triggerAsChild>
        <div tabIndex={-1}>{children}</div>
      </Tooltip>
    );
  },
);

export function SideNavigation({ expanded }: SideNavigationRootProps) {
  useEffect(() => {
    setSideNavigationState(expanded ? 'open' : 'closed');
  }, [expanded]);
  return (
    <NavigationMenu.Root
      orientation="vertical"
      className={classNames(
        'overflow-x-hidden overflow-y-auto shrink-0',
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'transition-[width]',
        'sticky left-0 top-[64px] scrolling-touch',
        {
          ['p-3']: expanded,
          ['px-2.5 py-3']: !expanded,
        },
      )}
      style={{
        width: expanded ? '240px' : '60px',
        height: 'calc(100vh - 64px)',
      }}
    >
      <NavigationMenu.List className={classNames('flex flex-col gap-1.5')}>
        {MenuItems.map((menuItem) => {
          const linkClass = classNames(
            'text-base font-medium text-gray-900 dark:text-white rounded-xl p-2 block',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'flex gap-3 whitespace-nowrap',
            'group',
            'focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-blue-700',
            {
              ['w-fit']: !expanded,
            },
          );

          return (
            <NavigationMenu.Item key={menuItem.title}>
              <NavigationMenu.Link asChild>
                <ItemWrapper expanded={expanded} title={menuItem.title}>
                  <NavLink
                    to={menuItem.to}
                    className={({ isActive }) =>
                      isActive
                        ? twMerge(linkClass, 'bg-gray-100 dark:bg-gray-700')
                        : linkClass
                    }
                  >
                    {({ isActive }) => {
                      return (
                        <>
                          <IconContext.Provider
                            value={{
                              className: classNames(
                                'w-6 h-6 group-hover:text-gray-900 dark:group-hover:text-white shrink-0',
                                {
                                  ['text-gray-900 dark:text-white']: isActive,
                                  ['text-gray-500 dark:text-gray-400']: !isActive,
                                },
                              ),
                            }}
                          >
                            <menuItem.Icon />
                          </IconContext.Provider>
                          {expanded && (
                            <div className="overflow-hidden flex-1">{menuItem.title}</div>
                          )}
                        </>
                      );
                    }}
                  </NavLink>
                </ItemWrapper>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

type SideNavigationState = 'open' | 'closed';
const storageKey = 'sideNavigationState';
export function getSideNavigationState(): SideNavigationState {
  return localStorage.getItem(storageKey)?.length
    ? (localStorage.getItem(storageKey) as SideNavigationState)
    : 'open';
}
export function setSideNavigationState(state: SideNavigationState) {
  localStorage.setItem(storageKey, state);
}
