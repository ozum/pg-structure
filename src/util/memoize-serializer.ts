/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * Serializer function for fast-memoize to be used with db objects.
 *
 * @ignore
 * @param args args passed to the original function.
 */
export default function memoizeSerializer(args: any): string {
  return JSON.stringify(
    (Array.isArray(args) ? args : [args]).map((arg: any) => {
      return arg.fullCatalogName ? `${arg.db.id},${arg.constructor.name},${arg.fullCatalogName}` : arg;
    })
  );
}
