import inflection from "inflection";
import memoize from "fast-memoize";

/**
 * Returns string, start and end index of `searchString` inside `text`. Searches both plural and singular form of `text`.
 *
 * @ignore
 * @param text is the string to search value in.
 * @param searchString is the string to search.
 * @returns string, start and end index of searchString inside text. Returns -1 if not found.
 */
function getIndexes(text: string, searchString: string): [string, number, number] {
  const pluralName = inflection.pluralize(searchString);
  const pluralIndex = text.indexOf(pluralName);

  if (pluralIndex > -1) {
    return [pluralName, pluralIndex, pluralIndex + pluralName.length];
  }

  const singularName = inflection.singularize(searchString);
  const singularIndex = text.indexOf(singularName);

  return [singularName, singularIndex, singularIndex === -1 ? -1 : singularIndex + singularName.length];
}

/**
 * Slices given text from start to end index. Also trims space, underscore (_) and dash (-)
 * characters from beginning and end of text.
 *
 * @ignore
 * @param text is the text to slice.
 * @param start is the index position to start slicing.
 * @param end is the index position to end slicing.
 */
function sliceAndTrim(text: string, start: number, end: number): string {
  return text
    .slice(start, end)
    .replace(/[\s_-]*$/, "")
    .replace(/^[\s_-]*/, "");
}

/**
 * Retunrs adjectives of `nameA` and `nameB`. Searches both singular and plural forms.
 * Works both for snake case and camle case strings.
 *
 * @ignore
 * @param text is the text to search names in.
 * @param nameA is the name to search for adjective.
 * @param nameB is the other name to search for adjective.
 * @returns adjectives for names.
 *
 * @example
 * getAdjectives("primary_contact_super_account", "contact", "account"); // ["primary", "super"]
 * getAdjectives("super_account_primary_contact", "contact", "account"); // ["primary", "super"]
 * getAdjectives("SuperAccountsPrimaryContacts", "Contact", "Account"); // ["primary", "super"]
 */
export default memoize((text: string, nameA: string, nameB: string): [string | undefined, string | undefined] => {
  // To prevent contained names collide (primary_product_super_product_category), first find longest one and replace it with spaces.
  const [longName, longStart, longEnd] = nameA.length > nameB.length ? getIndexes(text, nameA) : getIndexes(text, nameB);
  const replacedText = text.replace(longName, " ".repeat(longName.length));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [shortName, shortStart, shortEnd] =
    nameA.length <= nameB.length ? getIndexes(replacedText, nameA) : getIndexes(replacedText, nameB);

  const [aStart, aEnd, bStart, bEnd] =
    nameA.length > nameB.length ? [longStart, longEnd, shortStart, shortEnd] : [shortStart, shortEnd, longStart, longEnd];

  const aAdjectiveStart = aStart < bStart || bStart === -1 ? 0 : bEnd;
  const bAdjectiveStart = bStart < aStart || aStart === -1 ? 0 : aEnd;
  const aAdjective = aStart > -1 ? sliceAndTrim(text, aAdjectiveStart, aStart) : "";
  const bAdjective = bStart > -1 ? sliceAndTrim(text, bAdjectiveStart, bStart) : "";

  return [aAdjective === "" ? undefined : aAdjective, bAdjective === "" ? undefined : bAdjective];
});
