const qs = require('qs')
const sqlFormatter = require('sql-formatter')
const leosql = require('../src')

const query = `_table=user\
&_column=id&_column=name&_column=mail\
&_value=ID&_value=NAME&_value=MAIL\
&spawned_gte=20190101&spawned_lte=20190105\
&name=guest&name_ne=admin&name_ne=root\
&destroied_eq=true&destroied_eq=false\
&mail_end=@mail.com\
&_logic=or&_logic=and&_logic=or\
&_desc=spawned&_desc=modified&_asc=mail\
&_limit=20&_page=3`

const leo = leosql(qs.parse(query))

/**
query = {
  "_table": "accounts",                  // 表（字符串或数组）
  "_column": ["id", "name", "mail"],     // 字段（字符串或数组）
  "_value": ["ID", "NAME", "MAIL"],      // 值（字符串或数组）
  "spawned_gte": "20190101",             // 大于等于（字符串）
  "spawned_lte": "20190105",             // 小于等于（字符串）
  "name_ne": ["admin", "root"],          // 不等于（字符串或数组）
  "name": "guest",                       // 等于（字符串或数组，非转义）
  "destroied_eq": [true, false],         // 等于（字符串或数组）
  "mail_end": "@mail.com",               // 包含（字符串）
  "_logic": ["and", "and", "or"],        // 逻辑关系（字符串或数组）
  "_asc": "mail",                        // 顺序（字符串或数组）
  "_desc": ["spawned", "modified"],      // 逆序（字符串）
  "_limit": 20,                          // 容量（数字或字符串）
  "_page": 3,                            // 页码（数字或字符串）
}
*/

console.log(sqlFormatter.format(leo.select), '\n')
console.log(sqlFormatter.format(leo.insert), '\n')
console.log(sqlFormatter.format(leo.update), '\n')
console.log(sqlFormatter.format(leo.delete), '\n')
console.log(sqlFormatter.format(leo.count), '\n')

console.log('\nMETHOD:', leo.method)
console.log('\nTABLE:', leo.table)
console.log('\nCOLUMN:',leo.column)
console.log('\nWHERE_COLUMN:', leo.whereColumn)
console.log('\nVALUE:', leo.value)
console.log('\nWHERE:', leo.whereSql)
console.log('\nORDER:', leo.orderSql)
