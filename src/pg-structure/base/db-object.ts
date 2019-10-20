import { extractJSON, replaceJSON, caseTypeOf } from "../../util/helper";
import Db from "../db";
import Schema from "../schema";
import { JSONData, CaseType } from "../../types";

/** @ignore */
export interface DbObjectConstructorArgs {
  name: string;
  comment?: string | null;
}

/**
 * Abstract base class for all database objects.
 */
export default abstract class DbObject {
  /** @ignore */
  public constructor(args: DbObjectConstructorArgs) {
    this.name = args.name;
    this.comment = args.comment === null ? undefined : args.comment;
  }

  /**
   * {@link Schema} of the object.
   */
  abstract readonly schema: Schema;

  /**
   * Full name of the {@link DbObject database object} including parent name.
   */
  abstract get fullName(): string;

  /**
   * Full name of the {@link DbObject database object} including database name.
   */
  public get fullCatalogName(): string {
    return `${this.db.name}.${this.fullName}`;
  }

  /**
   * Name of the database object.
   */
  public readonly name: string;

  /**
   * Letter casing (i.e `snakeCase` or `camelCase`) of the {@link DbObject database object} name.
   *
   * @example
   * const name = entity.name;                        // ProductDetail
   * const caseType = entity.nameCaseType;            // camelCase
   *
   * const otherEntity = otherEntity.name;            // member_protocol
   * const otherCaseType = otherEntity.nameCaseType;  // snakeCase
   */
  public get nameCaseType(): CaseType {
    return caseTypeOf(this.name);
  }

  /**
   * Separator used in {@link DbObject database object} name. Empty string for came case and underscore for (_) snake case.
   */
  public get separator(): string {
    return this.nameCaseType === CaseType.CamelCase ? "" : "_";
  }

  /**
   * {@link Db Database} of the database object.
   */
  public get db(): Db {
    return this.schema._db;
  }

  /**
   * Comment of the database object defined in database including {@link DbObject#commentData comment data}.
   */
  public readonly comment?: string;

  /**
   * Description or comment of the database object defined in database. If comment contains {@link DbObject#commentData comment data},
   * it is removed.
   *
   * @example
   * // "Account details. [pg-structure]{ extraData: 2 }[/pg-structure] Also used for logging."
   * table.commentWithoutData;    // "Account details.  Also used for logging."
   */
  public get commentWithoutData(): string | undefined {
    return replaceJSON(this.db._config.commentDataToken, this.comment);
  }

  /**
   * Data which is extracted from database object's comment. Data is extracted from text between special case-insesitive tag
   * (default: `[pg-structure][/pg-structure]`) and converted to JavaScript object using [JSON5](https://json5.org).
   * Token name can be specified by using `commentDataToken` arguments.
   * For details of [JSON5](https://json5.org/), see it's web site: [https://json5.org](https://json5.org).
   *
   * @example
   * // "Account details. [pg-structure]{ extraData: 2 }[/pg-structure] Also used for logging."
   * table.comment;               // "Account details. [pg-structure]{ extraData: 2 }[/pg-structure] Also used for logging."
   * table.commentWithoutData;    // "Account details.  Also used for logging."
   * table.commentData;           // { extraData: 2 }
   * table.commentData.extraData; // 2
   */
  public get commentData(): JSONData | undefined {
    return extractJSON(this.db._config.commentDataToken, this.comment);
  }
}
