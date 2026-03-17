/**
 * Shared UI and design system.
 * Architecture: COMP-001, COMP-032
 */

export { Button, type ButtonProps } from "./components/button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from "./components/card";
export { Avatar, type AvatarProps, type AvatarSize } from "./components/avatar";
export { Badge, type BadgeProps } from "./components/badge";
export { Checkbox, type CheckboxProps } from "./components/checkbox";
export { Input, type InputProps } from "./components/input";
export { Textarea, type TextareaProps } from "./components/textarea";
export { Switch, type SwitchProps } from "./components/switch";
export {
  PillarBadge,
  type PillarBadgeProps,
  type PillarBadgePillar,
} from "./components/pillar-badge";
export { ProgressBar, type ProgressBarProps } from "./components/progress-bar";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroupLabel,
  SelectSeparator,
} from "./components/select";
export { ThemeToggle, type ThemeToggleProps } from "./components/theme-toggle";
export {
  Sheet,
  SheetContent,
  SheetTrigger,
  type SheetProps,
  type SheetContentProps,
  type SheetTriggerProps,
} from "./components/sheet";
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type DialogContentProps,
  type DialogContentSize,
} from "./components/dialog";
export {
  Navbar,
  type NavbarProps,
  type NavbarLink,
} from "./components/navbar";
export { Footer, type FooterProps, type FooterColumn } from "./components/footer";
export { Skeleton, type SkeletonProps } from "./components/skeleton";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  tooltipDelayDuration,
  type TooltipProviderProps,
  type TooltipContentProps,
} from "./components/tooltip";
export { FormField, type FormFieldProps } from "./components/form-field";
export { Toaster, toast, type ToastToasterProps } from "./components/toast";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/dropdown-menu";
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  type BreadcrumbProps,
  type BreadcrumbItemProps,
  type BreadcrumbSeparatorProps,
} from "./components/breadcrumb";
export { StatCard, type StatCardProps } from "./components/stat-card";
export { EmptyState, type EmptyStateProps } from "./components/empty-state";
export { TabBar, TabList, TabTrigger, TabContent } from "./components/tab-bar";
export { PageHeader, type PageHeaderProps } from "./components/page-header";
export {
  EntityHeader,
  type EntityHeaderProps,
  type EntityHeaderStat,
} from "./components/entity-header";
export { ListRow, type ListRowProps, type ListRowStatus } from "./components/list-row";
export { Logo, type LogoProps } from "./components/logo";
export { AppLayout, type AppLayoutProps, type NavLinkConfig } from "./components/app-layout";
export {
  ThemeProvider,
  useTheme,
  type Theme,
} from "./components/theme-provider";
export {
  MonacoEditor,
  type MonacoEditorProps,
  type MonacoLanguage,
} from "./components/monaco-editor";
export {
  IdeReconnectionIndicator,
  type IdeReconnectionIndicatorProps,
} from "./components/ide-reconnection-indicator";
export {
  IdeWorkspaceRestoreIndicator,
  type IdeWorkspaceRestoreIndicatorProps,
} from "./components/ide-workspace-restore-indicator";
export { cn } from "./lib/utils";
