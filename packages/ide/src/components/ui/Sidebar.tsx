import { PanelLeftIcon } from "lucide-react";
import { Dialog as SheetPrimitive, Slot } from "radix-ui";
import * as React from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

import { Button } from "./Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";
import styles from "./Sidebar.module.css";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "17rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3.5rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Estado interno; `open` e `onOpenChange` permitem controlar a sidebar de fora.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(open => !open);
    } else {
      setOpen(open => !open);
    }
  }, [isMobile, setOpen, setOpenMobile]);

  // Ctrl+B abre e fecha a sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(styles.wrapper, className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/**
 * No desktop, recolhe para uma coluna de ícones (`data-collapsible="icon"`); no celular, vira
 * uma gaveta que desliza da esquerda.
 */
export function Sidebar({ className, children, ...props }: React.ComponentProps<"div">) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <SheetPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <SheetPrimitive.Portal data-slot="sheet-portal">
          <SheetPrimitive.Overlay data-slot="sheet-overlay" className={styles.sheetOverlay} />
          <SheetPrimitive.Content
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className={styles.sheet}
            style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          >
            <div data-slot="sheet-header" className={styles.sheetHeader}>
              <SheetPrimitive.Title data-slot="sheet-title" className={styles.sheetTitle}>
                Sidebar
              </SheetPrimitive.Title>
              <SheetPrimitive.Description data-slot="sheet-description" className={styles.sheetDescription}>
                Displays the mobile sidebar.
              </SheetPrimitive.Description>
            </div>
            <div className={styles.sheetBody}>{children}</div>
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      </SheetPrimitive.Root>
    );
  }

  return (
    <div
      className={styles.sidebar}
      data-state={state}
      data-collapsible={state === "collapsed" ? "icon" : ""}
      data-variant="sidebar"
      data-side="left"
      data-slot="sidebar"
    >
      {/* Reserva o espaço da sidebar, que fica fixa por cima do layout. */}
      <div data-slot="sidebar-gap" className={styles.gap} />
      <div data-slot="sidebar-container" className={cn(styles.container, className)} {...props}>
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className={styles.inner}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn(styles.trigger, className)}
      onClick={event => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Alternar barra lateral</span>
    </Button>
  );
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return <main data-slot="sidebar-inset" className={cn(styles.inset, className)} {...props} />;
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" data-sidebar="header" className={cn(styles.section, className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn(styles.section, className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-content" data-sidebar="content" className={cn(styles.content, className)} {...props} />
  );
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group" data-sidebar="group" className={cn(styles.group, className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(styles.groupLabel, className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn(styles.menu, className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn(styles.menuItem, className)} {...props} />
  );
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  size?: "default" | "lg";
  tooltip?: string;
}) {
  const Comp = asChild ? Slot.Root : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(styles.menuButton, size === "lg" ? styles.menuButtonLg : styles.menuButtonDefault, className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Botão secundário no canto do item (ex.: menu "…"). Aparece no hover do item.
 */
export function SidebarMenuAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(styles.menuAction, className)}
      {...props}
    />
  );
}
