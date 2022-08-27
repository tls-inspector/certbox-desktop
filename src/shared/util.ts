/**
 * Encode the given string as hex
 * @param s Input string
 * @returns A hex string
 */
export const atoh = (s: string): string => {
    let result = '';
    for (let i = 0; i < s.length; i++) {
      result += s.charCodeAt(i).toString(16);
    }
    return result;
};
