import React from 'react';
import { Drawer } from 'vaul';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function MobileDropdownMenu({ children, trigger, ...props }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  if (!isMobile) {
    return (
      <DropdownMenu {...props}>
        {children}
      </DropdownMenu>
    );
  }

  // Extract trigger and content from children
  const triggerChild = React.Children.toArray(children).find(
    child => child.type === DropdownMenuTrigger
  );
  const contentChild = React.Children.toArray(children).find(
    child => child.type === DropdownMenuContent
  );

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {triggerChild?.props?.children || trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-4" />
          <div className="px-4 pb-8">
            {contentChild?.props?.children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function MobileSelect({ children, trigger, value, onValueChange, ...props }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  if (!isMobile) {
    return children;
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-4" />
          <div className="px-4 pb-8 space-y-2">
            {React.Children.map(children, (child) => {
              if (child?.props?.value !== undefined) {
                return (
                  <button
                    onClick={() => {
                      onValueChange?.(child.props.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      value === child.props.value
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {child.props.children}
                  </button>
                );
              }
              return null;
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export { useIsMobile };