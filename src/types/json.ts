/** @ignore */
export type Primitive = string | number | boolean | null;

/** @ignore */
export interface JSONObject {
  [member: string]: JSONData | undefined;
}

/** @ignore */
export interface JSONArray extends Array<JSON> {} // eslint-disable-line @typescript-eslint/no-empty-interface

/** @ignore */
export type JSONData = Primitive | JSONObject | JSONArray;
