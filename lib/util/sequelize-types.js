/**
 * @author Özüm Eldoğan
 */
/*jslint node: true */
"use strict";

// PostgreSQL Enum type comes as user-defined. As a result it should be handled manually.
module.exports = {
    'array'                         : { type: '.ARRAY' },
    'bigint'                        : { type: '.BIGINT', hasLength: true },
    'bigserial'                     : { type: '.BIGINT', hasLength: true },
    'bit'                           : { type: '.CHAR', hasLength: true },         // Not directly supported in Sequelize
    'bit varying'                   : { type: '.STRING', hasLength: true },       // Not directly supported in Sequelize
    'boolean'                       : { type: '.BOOLEAN' },
    'box'                           : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'bytea'                         : { type: '.BLOB' },
    'character'                     : { type: '.CHAR', hasLength: true },
    'character varying'             : { type: '.STRING', hasLength: true },
    'cidr'                          : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'circle'                        : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'date'                          : { type: '.DATEONLY' },
    'double precision'              : { type: '.FLOAT', hasPrecision: true },
    'hstore'                        : { type: '.HSTORE' },
    'inet'                          : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'integer'                       : { type: '.INTEGER', hasLength: true },
    'interval'                      : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'json'                          : { type: '.JSON' },
    'jsonb'                         : { type: '.JSONB' },
    'line'                          : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'lseg'                          : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'macaddr'                       : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'money'                         : { type: '.DECIMAL', hasPrecision: true },
    'numeric'                       : { type: '.DECIMAL', hasPrecision: true },
    'path'                          : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'point'                         : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'polygon'                       : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'real'                          : { type: '.FLOAT', hasPrecision: true },
    'smallint'                      : { type: '.INTEGER', hasLength: true },
    'smallserial'                   : { type: '.INTEGER', hasLength: true },
    'serial'                        : { type: '.INTEGER', hasLength: true },
    'text'                          : { type: '.TEXT' },
    'time without time zone'        : { type: '.TIME' },
    'time with time zone'           : { type: '.TIME' },
    'timestamp without time zone'   : { type: '.DATE' },
    'timestamp with time zone'      : { type: '.DATE' },
    'tsquery'                       : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'tsvector'                      : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'txid_snapshot'                 : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'uuid'                          : { type: '.UUID' },
    'xml'                           : { type: '.STRING', hasLength: true },     // Not directly supported in Sequelize
    'user-defined'                  : { type: '.STRING', hasLength: true }      // Not directly supported in Sequelize
};
