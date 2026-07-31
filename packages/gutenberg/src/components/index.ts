// Pure UI building blocks (no knowledge of meta/taxonomy/post types or editor stores).
// TODO(stage 7): SearchableSelect, Skeleton, EmptyState, LoadingOverlay —
// written from scratch, config injected via props (decision 0001).
export { BreakpointSwitcher } from './BreakpointSwitcher/index.js';
export type { BreakpointSwitcherProps } from './BreakpointSwitcher/index.js';
export { ColorPopup } from './ColorPopup/index.js';
export type { ColorPopupProps, ColorPopupColor } from './ColorPopup/index.js';
export {
	getLocalizedIcons,
	Icon,
	parseLocalizedIcons,
	resolveIcons,
} from './Icon/index.js';
export type {
	IconChoice,
	IconCollectionProps,
	IconDefinition,
	IconGraphic,
	IconProps,
} from './Icon/index.js';
export { IconPicker } from './IconPicker/index.js';
export type { IconPickerProps } from './IconPicker/index.js';
export { IconSelect } from './IconSelect/index.js';
export type { IconSelectProps } from './IconSelect/index.js';
