/**
 * Returns an element from the candidate list that is not in the used list
 * @param candidates list of candidate elements
 * @param used elements that cannot be returned
 */
function uniqueElement<T>(candidates: T[], used: T[]) : (T | null) {
    let valid: boolean = false;

    let index: number;
    for (index = 0; index < candidates.length && !valid; index++) {
        valid = used.indexOf(candidates[index]) < 0;
    }

    if (valid) {
        return candidates[index - 1];
    } else {
        return null;
    }
}

export default uniqueElement;