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
