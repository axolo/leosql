// const qs = require('qs')
// const query = qs.parse(request.query)
const leosql = require('../src')
const query = {
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

const select = leosql.qs2sql({ query: query, method: 'select', beauty: true })
const update = leosql.qs2sql({ query: query, method: 'update', beauty: true })
const count = leosql.qs2sql({ query: query, method: 'count', beauty: true })
const columns = leosql.qs2sql({ query: query, method: 'columns', beauty: true })


console.log(select)
console.log('----------------------------------------')
console.log(update)
console.log('----------------------------------------')
console.log(count)
console.log('----------------------------------------')
console.log(columns)
