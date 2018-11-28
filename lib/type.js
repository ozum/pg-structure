'use strict';

let CMap        = require('./util/cmap');
let helper      = require('./util/helper');
let _data       = new WeakMap();
let attributes  = ['name', ['description', 'comment'], ['parent', 'schema'], 'columns'];

/**
 * Class which represent a custom PostgreSQL type. Provides attributes and methods for details of the type.
 */
class Type {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object} args                - Attributes of the {@link Type} instance to be created.
     * @param   {Schema} args.parent         - Parent {@link Schema} of the Type.
     * @param   {string} args.name           - Name of the Type.
     * @param   {string} args.description    - Description of the Type.
     * @returns {Type}                       - Created {@link Type} instance.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Type name is required.'); }

        let _ = _data.set(this, {}).get(this);

        _.name                  = args.name;
        _.parent                = args.parent;
        _.description           = helper.replaceJSON(args.description);

        _.columns               = new CMap();
    }

    serialize() {
        let _ = _data.get(this);

        let result = helper.serialize(_, ['name', 'description']);
        result.columns = Array.from(_.columns).map(i => i[1].serialize());
        return result;
    }
}

helper.createAccessors(_data, Type, attributes);

function getFullName() {
    let _ = _data.get(this);
    return _.parent.name + "." + _.name;
}

function getFullCatalogName() {
    let _ = _data.get(this);
    return this.db.name + "." + _.parent.name + "." + _.name;
}

function getDb() {
    let _ = _data.get(this);
    return _.parent.db;
}

// ATTRIBUTES

/**
 * @name Type#name
 * @type {string}
 * @readonly
 * @description Name of the type.
 */

/**
 * @name Type#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Type}.
 * @example
 * var fullName = type.fullName; // public
 */
Object.defineProperty(Type.prototype, "fullName", { get: getFullName, enumerable: true });


/**
 * @name Type#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Type} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = schema.fullCatalogName; // crm.public
 */
Object.defineProperty(Type.prototype, 'fullCatalogName', { enumerable: true, get: getFullCatalogName });

/**
 * @name Type#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this type belongs to.
 * @see Aliases {@link Type#parent parent}
 * @example
 * var schema = type.schema; // Schema instance
 */


/**
 * @name Type#parent
 * @type {Db}
 * @readonly
 * @description {@link Db} this schema belongs to.
 * @see Aliases {@link Type#schema schema}
 * @example
 * var db = type.parent; // Schema instance
 */

/**
 * @name Type#db
 * @type {Db}
 * @readonly
 * @description {@link Db} this type belongs to.
 */
Object.defineProperty(Type.prototype, "db", { get: getDb, enumerable: true });



/**
 * @name Type#comment
 * @type {string}
 * @readonly
 * @description Comment of the type.
 * @see Aliases {@link Type#description description}
 */

/**
 * @name Type#description
 * @type {string}
 * @readonly
 * @description Comment of the schema.
 * @see Aliases {@link Type#comment comment}
 */

/**
 * @name Type#columns
 * @type {Map.<Column>}
 * @readonly
 * @description All {@link Column} instances in the type as a {@link Map}. They are ordered same order as they are
 * defined in database type.
 * @see {@link Map}
 * @example
 * var isAvailable  = type.columns.has('foo');
 * var column       = type.columns.get('user_id');
 * var name         = column.name;
 *
 * for (let column of type.columns.values()) {
 *     console.log(column.name);
 * }
 *
 * for (let [name, column] of type.columns) {
 *     console.log(name, column.name);
 * }
 */


// METHODS

/**
 * Returns {@link Column} on given path relative to {@link Type}.
 * @method Type#get
 * @param {string}                  path    - Path of the requested item in dot (.) notation such as 'public.contact'
 * @returns {Column|undefined}              - Requested item.
 * @example
 * var column = type.get('contact'),      // Returns contact column of the type.
 */
Object.defineProperty(Type.prototype, "get", {
    value: function(column) {
        return this.columns.get(column);
    },
    enumerable: false
});
module.exports = Type;
