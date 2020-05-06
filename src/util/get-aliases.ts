import memoize from "fast-memoize";
import ForeignKey from "../pg-structure/constraint/foreign-key";
import getAdjectives from "./get-adjectives";
import memoizeSerializer from "./memoize-serializer";

/**
 * Returns table and referenced table aliases for given foreign key.
 *
 * @ignore
 * @param fk is the foreign key to get table and referenced table aliases for.
 */
function getAliases(fk: ForeignKey): [string, string] {
  const aliases = fk.name.split(fk.db._config.foreignKeyAliasSeparator).map((alias) => alias.trim());

  if (aliases.length === 2) {
    return (fk.db._config.foreignKeyAliasTargetFirst ? aliases.reverse() : aliases) as [string, string];
  }

  // const [tableAdjective, referencedTableAdjective] = getAdjectives(fk);
  const [tableAdjective, referencedTableAdjective] = getAdjectives(fk.name, fk.table.name, fk.referencedTable.name);

  return [
    tableAdjective ? `${tableAdjective}${fk.separator}${fk.table.name}` : fk.table.name,
    referencedTableAdjective ? `${referencedTableAdjective}${fk.separator}${fk.referencedTable.name}` : fk.referencedTable.name,
  ];
}

export default memoize(getAliases, { serializer: memoizeSerializer });
