import { useEffect, useState } from '@wordpress/element';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of no changes.
 */
export function useDebouncedValue< T >( value: T, delay = 300 ): T {
	const [ debounced, setDebounced ] = useState< T >( value );

	useEffect( () => {
		const timer = setTimeout( () => setDebounced( value ), delay );
		return () => clearTimeout( timer );
	}, [ value, delay ] );

	return debounced;
}
