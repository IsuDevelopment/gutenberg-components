import type { ReactElement } from 'react';
import { MediaCanvasControl } from '../MediaCanvasControl/index.js';
import { MediaSidebarControl } from '../MediaSidebarControl/index.js';
import { MediaToolbarControl } from '../MediaToolbarControl/index.js';
import type { MediaControlProps } from './types.js';

/** Full media editor composed from independently importable location controls. */
export function MediaControl( {
	value = {},
	onChange,
	onRemove,
	focalPoint,
	onFocalPointChange,
	allowedTypes = [ 'image' ],
	imageSize,
	disabled = false,
	sources,
	resetFocalPointOnChange = false,
	canvas = {},
	toolbar = {},
	sidebar = {},
}: MediaControlProps ): ReactElement {
	const maybeResetFocalPoint = () => {
		if ( resetFocalPointOnChange && focalPoint && onFocalPointChange ) {
			onFocalPointChange( undefined );
		}
	};

	const changeMedia: typeof onChange = ( nextValue, nativeMedia ) => {
		if (
			nextValue.id !== value.id ||
			nextValue.url !== value.url
		) {
			maybeResetFocalPoint();
		}
		onChange( nextValue, nativeMedia );
	};

	const removeMedia = () => {
		maybeResetFocalPoint();
		if ( onRemove ) {
			onRemove();
		} else {
			onChange( {} );
		}
	};

	const commonPickerProps = { allowedTypes, imageSize, disabled };

	return (
		<>
			{ toolbar !== false && (
				<MediaToolbarControl
					{ ...toolbar }
					value={ value }
					onChange={ changeMedia }
					onRemove={ removeMedia }
					sources={ toolbar.sources ?? sources }
					pickerProps={ {
						...commonPickerProps,
						...toolbar.pickerProps,
					} }
				/>
			) }
			{ sidebar !== false && (
				<MediaSidebarControl
					{ ...sidebar }
					value={ value }
					onChange={ changeMedia }
					onRemove={ removeMedia }
					focalPoint={ focalPoint }
					onFocalPointChange={ onFocalPointChange }
					sources={ sidebar.sources ?? sources }
					pickerProps={ {
						...commonPickerProps,
						...sidebar.pickerProps,
					} }
				/>
			) }
			{ canvas !== false && (
				<MediaCanvasControl
					{ ...canvas }
					value={ value }
					onChange={ changeMedia }
					onRemove={ removeMedia }
					sources={ canvas.sources ?? sources }
					pickerProps={ {
						...commonPickerProps,
						...canvas.pickerProps,
					} }
				/>
			) }
		</>
	);
}
