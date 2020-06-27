import Func from "../base/func";

/**
 * Class which represent a PostgreSQL ({@link NormalFunction normal function}.
 * Provides attributes and methods for details of the normal function.
 * Class name is `NormalFunction` because procedures, aggregate functions, and window functions are
 * classified as functions by PostgreSQL. The term "normal function" is used by PostgreSQL.
 * See `prokind` attribute at https://www.postgresql.org/docs/12/catalog-pg-proc.html.
 */
export default class NormalFunction extends Func {}
