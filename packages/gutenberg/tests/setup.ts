import '@testing-library/jest-dom';

// jsdom does not implement ResizeObserver. Several @wordpress/components internals
// (e.g. ToggleGroupControl) observe their container's size, so a no-op stand-in is needed
// for them to mount under jsdom at all — this is an environment shim, not a component change.
class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

( globalThis as unknown as { ResizeObserver: unknown } ).ResizeObserver =
	MockResizeObserver;

// jsdom does not implement window.matchMedia. @wordpress/components' `Flex` reads it on
// mount, via `useResponsiveValue`, to resolve its responsive `direction` prop — `gap` is not
// responsive and goes straight to `space( gap )`. So a no-op stand-in is needed for `Flex`
// to mount under jsdom at all, same rationale as the `ResizeObserver` shim above.
if ( ! window.matchMedia ) {
	window.matchMedia = ( query: string ): MediaQueryList =>
		( {
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		} ) as unknown as MediaQueryList;
}
