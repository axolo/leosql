const qs = require('qs')
const leosql = require('../src')

const query = `_table=user\
&_column=id&_column=name&_column=mail\
&_value=ID&_value=NAME&_value=MAIL\
&spawned_gte=20190101&spawned_lte=20190105\
&name_ne=admin&name_ne=root\
&destroied_eq=true&destroied_eq=false\
&mail_end=%40mail.com\
&_logic=and&_logic=and&_logic=or\
&_desc=spawned&_desc=modified&_asc=mail\
&_limit=20&_page=3`

const sql = leosql(qs.parse(query), true)

/**
query = {
  "_table": "accounts",                  // 表（字符串或数组）
  "_column": ["id", "name", "mail"],     // 字段（字符串或数组）
  "_value": ["ID", "NAME", "MAIL"],      // 值（字符串或数组）
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

console.log('-- INSERT -------------------')
console.log(sql.insert())
console.log('-- SELECT -------------------')
console.log(sql.select())
console.log('-- UPDATE -------------------')
console.log(sql.update())
console.log('-- DELETE -------------------')
console.log(sql.delete())
console.log('-- COUNT -------------------')
console.log(sql.count())

// console.log(sql.getTable())
// console.log(sql.getColumn())
// console.log(sql.getValue())
// console.log(sql.getWhere())
// console.log(sql.order())
