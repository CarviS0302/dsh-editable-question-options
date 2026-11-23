/**
 * Editable question options — Host half.
 *
 * The capability is purely a Web Client presentation of the existing
 * `ask_user_question` composer seat; the Host already transports the
 * question request and accepts an answer whose item may carry both
 * `selected` labels and a `custom` free-form note. No Host service, tool,
 * or event is added, so this half only exists to give the bundle a host
 * row whose `dsh.client` declaration loads the browser half.
 */

/** Host plugin body — intentionally empty. */
export function apply() {}
