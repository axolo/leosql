const qs = require('qs')
const leosql = require('../src')
const querystring = `_sets=accounts&_fields[]=id&_fields[]=name&_fields[]=mail&_values[]=ID&_values[]=NAME&_values[]=MAIL&spawned_gte=20190101&spawned_lte=20190105&name_ne[]=admin&name_ne[]=root&destroied_eq[]=true&destroied_eq[]=false&mail_end=%40mail.com&_logic[]=and&_logic[]=and&_logic[]=or&_asc=mail&_desc[]=spawned&_desc[]=modified&_limit=20&_page=3`
const query = qs.parse(querystring)

// const query = {
//   "_sets": "accounts",                   // 表（字符串或数组）
//   "_fields": ["id", "name", "mail"],     // 字段（字符串或数组）
//   "_values": ["ID", "NAME", "MAIL"],     // 值（字符串或数组）
//   "spawned_gte": "20190101",             // 大于等于（字符串）
//   "spawned_lte": "20190105",             // 小于等于（字符串）
//   "name_ne": ["admin", "root"],          // 不等于（字符串或数组）
//   "destroied_eq": [true, false],         // 等于（字符串或数组）
//   "mail_end": "@mail.com",               // 包含（字符串）
//   "_logic": ["and", "and", "or"],        // 逻辑关系（字符串或数组）
//   "_asc": "mail",                        // 顺序（字符串或数组）
//   "_desc": ["spawned", "modified"],      // 逆序（字符串）
//   "_limit": 20,                          // 容量（数字或字符串）
//   "_page": 3,                            // 页码（数字或字符串）
// }

const select = leosql.qs2sql({ query: query, method: 'select', beauty: true })
const update = leosql.qs2sql({ query: query, method: 'update', beauty: true })
const insert = leosql.qs2sql({ query: query, method: 'insert', beauty: true })
const destory = leosql.qs2sql({ query: query, method: 'delete', beauty: true })
const count = leosql.qs2sql({ query: query, method: 'count', beauty: true })
const columns = leosql.qs2sql({ query: query, method: 'columns', beauty: true })

console.log('-- -------------------------------------')
console.log('-- QueryString')
console.log('-- -------------------------------------')
console.log(querystring)
console.log('-- -------------------------------------')
console.log('-- Query')
console.log('-- -------------------------------------')
console.log(query)
console.log('-- -------------------------------------')
console.log('-- SELECT COUNT(*)')
console.log('-- -------------------------------------')
console.log(count)
console.log('-- -------------------------------------')
console.log('-- SELECT')
console.log('-- -------------------------------------')
console.log(select)
console.log('-- -------------------------------------')
console.log('-- INSERT')
console.log('-- -------------------------------------')
console.log(insert)
console.log('-- -------------------------------------')
console.log('-- UPDATE')
console.log('-- -------------------------------------')
console.log(update)
console.log('-- -------------------------------------')
console.log('-- DELETE')
console.log('-- -------------------------------------')
console.log(destory)
console.log('-- -------------------------------------')
console.log('-- columns')
console.log('-- -------------------------------------')
console.log(columns)
