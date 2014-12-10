/**
 * @author Özüm Eldoğan
 */
/*jslint node: true */
"use strict";

// PostgreSQL Enum type comes as user-defined. As a result it should be handled manually.
module.exports = {
    'array'                         : { type: '.ARRAY' },
    'bigint'                        : { type: '.BIGINT', hasPrecision: true },
    'bigserial'                     : { type: '.BIGINT', hasPrecision: true },
    'bit'                           : { type: '.CHAR' },         // Not directly supported in Sequelize
    'bit varying'                   : { type: '.STRING' },       // Not directly supported in Sequelize
    'boolean'                       : { type: '.BOOLEAN' },
    'box'                           : { type: '.STRING' },     // Not directly supported in Sequelize
    'bytea'                         : { type: '.BLOB' },
    'character'                     : { type: '.CHAR' },
    'character varying'             : { type: '.STRING' },
    'cidr'                          : { type: '.STRING' },     // Not directly supported in Sequelize
    'circle'                        : { type: '.STRING' },     // Not directly supported in Sequelize
    'date'                          : { type: '.DATE' },
    'double precision'              : { type: '.FLOAT', hasPrecision: true },
    'hstore'                        : { type: '.HSTORE' },
    'inet'                          : { type: '.STRING' },     // Not directly supported in Sequelize
    'integer'                       : { type: '.INTEGER', hasPrecision: true },
    'interval'                      : { type: '.STRING' },     // Not directly supported in Sequelize
    'json'                          : { type: '.JSON' },
    'line'                          : { type: '.STRING' },     // Not directly supported in Sequelize
    'lseg'                          : { type: '.STRING' },     // Not directly supported in Sequelize
    'macaddr'                       : { type: '.STRING' },     // Not directly supported in Sequelize
    'money'                         : { type: '.DECIMAL', hasPrecision: true },
    'numeric'                       : { type: '.DECIMAL', hasPrecision: true },
    'path'                          : { type: '.STRING' },     // Not directly supported in Sequelize
    'point'                         : { type: '.STRING' },     // Not directly supported in Sequelize
    'polygon'                       : { type: '.STRING' },     // Not directly supported in Sequelize
    'real'                          : { type: '.FLOAT', hasPrecision: true },
    'smallint'                      : { type: '.INTEGER', hasPrecision: true },
    'smallserial'                   : { type: '.INTEGER', hasPrecision: true },
    'serial'                        : { type: '.INTEGER', hasPrecision: true },
    'text'                          : { type: '.TEXT' },
    'time without time zone'        : { type: '.TIME', hasPrecision: true },
    'time with time zone'           : { type: '.TIME', hasPrecision: true },
    'timestamp without time zone'   : { type: '.DATE', hasPrecision: true  },
    'timestamp with time zone'      : { type: '.DATE', hasPrecision: true },
    'tsquery'                       : { type: '.STRING' },     // Not directly supported in Sequelize
    'tsvector'                      : { type: '.STRING' },     // Not directly supported in Sequelize
    'txid_snapshot'                 : { type: '.STRING' },     // Not directly supported in Sequelize
    'uuid'                          : { type: '.UUID' },
    'xml'                           : { type: '.STRING' },     // Not directly supported in Sequelize
    'user-defined'                  : { type: '.STRING' }      // Not directly supported in Sequelize
};