const querystring = `_tables=accounts&_tables=user\
&_fields[]=id&_fields[]=name&_fields[]=mail\
&_values[]=ID&_values[]=NAME&_values[]=MAIL\
&spawned_gte=20190101&spawned_lte=20190105\
&name_ne[]=admin&name_ne[]=root\
&destroied_eq[]=true&destroied_eq[]=false\
&mail_end=%40mail.com\
&_logic[]=and&_logic[]=and&_logic[]=or\
&_asc=mail&_desc[]=spawned&_desc[]=modified\
&_limit=20&_page=3`

const qs = require('qs')
const query = qs.parse(querystring)

/**
query = {
  "_sets": "accounts",                   // 表（字符串或数组）
  "_fields": ["id", "name", "mail"],     // 字段（字符串或数组）
  "_values": ["ID", "NAME", "MAIL"],     // 值（字符串或数组）
  "spawned_gte": "20190101",             // 大于等于（字符串）
  "spawned_lte": "20190105",             // 小于等于（字符串）
  "name_ne": ["admin", "root"],          // 不等于（字符串或数组）
  "destroied_eq": [true, false],         // 等于（字符串或数组）
  "mail_end": "@mail.com",               // 包含（字符串）
  "_logic": ["and", "and", "or"],        // 逻辑关系（字符串或数组）
  "_asc": "mail",                        // 顺序（字符串或数组）
  "_desc": ["spawned", "modified"],      // 逆序（字符串）
  "_limit": 20,                          // 容量（数字或字符串）
  "_page": 3,                            // 页码（数字或字符串）
}
*/

const LeoSQL = require('../src')
const leosql = new LeoSQL(query)

console.log(leosql.getTables())
console.log(leosql.getFields())
console.log(leosql.getValues())
console.log(leosql.getWhere())
console.log(leosql.getLogic())
console.log(leosql.getLimit())
console.log(leosql.getOffset())
console.log(leosql.getOrder())
console.log(leosql.sqlSelect())
