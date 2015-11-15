<a name="Relation"></a>
## Relation
Base class for relations. Not used directly. See child classes.

**Kind**: global class  
**See**

- [O2MRelation](O2MRelation) for one to many relationships.
- [M2MRelation](M2MRelation) for many to many relationships.
- [M2ORelation](M2ORelation) for many to one relationships.

<a name="new_Relation_new"></a>
### new Relation(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Referential constraint arguments. |
| args.registry | <code>Loki</code> | Loki.js database object. |
| args.attributes | <code>Object</code> | Attributes of the [Relation](#Relation) instance. |

