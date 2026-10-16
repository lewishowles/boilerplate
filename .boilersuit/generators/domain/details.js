import { useDetailQuery } from "@/queries/use-detail-query/use-detail-query";
import { {{ NAME | camel }}Domain } from "./definition.js";

/**
 * Provide access to a {{ SINGULAR_NAME | words }} record.
 *
 * @param  {string|Ref<string>}  {{ ID_NAME }}
 *     The {{ SINGULAR_NAME | words }} ID. No request is sent while it is empty.
 *
 * @returns  {object}
 *     The query state, the {{ SINGULAR_NAME | words }} record, and whether it has loaded.
 */
export function use{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}) {
	// The shared detail state. The record and whether it has loaded are
	// returned below under this domain's names.
	const { haveRecord, record, ...current{{ SINGULAR_NAME | pascal }} } = useDetailQuery({
		domain: {{ NAME | camel }}Domain,
		id: {{ ID_NAME }},
	});

	return {
		...current{{ SINGULAR_NAME | pascal }},
		have{{ SINGULAR_NAME | pascal }}: haveRecord,
		{{ SINGULAR_NAME | camel }}: record,
	};
}
