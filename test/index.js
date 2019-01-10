const leosql = require('../src')

const sql = leosql.qs2sql({
  "_fields": "id,name,mail",      // 字段（逗号分隔）
  "_sets": "accounts",             // 表（逗号分隔）
  "spawned_gte": "20190101",      // 创建日期大于等于 2019-01-01
  "spawned_lte": "20190105",      // 创建日期小于等于 2019-01-05
  "destroied_eq": "1,0",          // 非已注销的
  "mail_end": "@mail.com",        // 邮件以 @mail.com 结尾
  "_logic": "and,and,or",          // 以上4个条件逻辑关系为：且且或（默认为且，以逗号分隔）
  "_asc": "mail",                 // 按邮件顺序（逗号分隔）
  "_desc": "spawned,modifyed",    // 按创建日期和修改日期倒序（逗号分隔）
  "_page": "3",                   // 第 2 页，即从第 40 行开始
  "_limit": "20",                 // 每页 20 条
}, 'sql', true)

console.log(sql)
