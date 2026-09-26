import { useCallback, useMemo, useState } from 'react';
import { toReferences } from '../../_internal/post-picker/value.js';
import { PostPickerModal } from '../PostPickerModal/PostPickerModal.js';
import type { PostPickerControlProps } from './types.js';

/**
 * Opens the post picker modal from any consumer-rendered trigger. Controlled: the selection
 * lives in `value` and leaves through `onChange`, so it can be a block attribute, meta or
 * plain component state.
 */
export function PostPickerControl( {
	children,
	disabled = false,
	modalClassName,
	onClose,
	...modalProps
}: PostPickerControlProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const count = useMemo(
		() => toReferences( modalProps.value ).length,
		[ modalProps.value ]
	);

	const open = useCallback( () => {
		if ( ! disabled ) {
			setIsOpen( true );
		}
	}, [ disabled ] );

	const close = useCallback( () => {
		setIsOpen( false );
		onClose?.();
	}, [ onClose ] );

	return (
		<>
			{ children( { open, hasSelection: count > 0, count, disabled } ) }
			{ isOpen && (
				<PostPickerModal
					{ ...modalProps }
					className={ modalClassName }
					onClose={ close }
				/>
			) }
		</>
	);
}
