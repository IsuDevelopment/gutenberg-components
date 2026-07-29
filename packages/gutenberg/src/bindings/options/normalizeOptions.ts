import type { FieldOption } from '../../types/options';

/**
 * Coerces a REST record into a `FieldOption` using the given label/value fields.
 * Handles WordPress rendered fields (e.g. `title.rendered`).
 */
export function toFieldOption(
	record: Record< string, any >,
	labelField: string,
	valueField: string
): FieldOption {
	const rawLabel = record[ labelField ];
	const label =
		rawLabel && typeof rawLabel === 'object' && 'rendered' in rawLabel
			? String( rawLabel.rendered )
			: String( rawLabel ?? '' );

	return {
		label,
		value: record[ valueField ],
	};
}
