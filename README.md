# LeoSQL

将`HTTP`的`querystring`或`body`转换为存储引擎（比如[`MySQL`](https://github.com/mysqljs/mysql)）能够理解和执行的格式，
同时确保存储安全，不被恶意注入攻击，是一项不小的挑战。常规的检索数据方法有：

- 条件（`WHERE`）
  - 等于（`_eq`）
  - 不等于（`_ne`）
  - 大于（`_gt`）
  - 小于（`_lt`）
  - 大于等于（`_gte`）
  - 小于等于（`_lte`）
  - 含有（`_have`）
  - 开头含有（`_start`）
  - 结尾含有（`_end`）
- 关系（`_logic`）
  - 且（`AND`）
  - 或（`OR`）
- 排序（`ORDER BY`）
  - 顺序（`_asc`）
  - 逆序（`_desc`）
- 分页（`LIMIT`）
  - 页码（`_page`）
  - 单页记录数（`_limit`）
- 全文（`FULLTEXT`）
  - 含有（`_q`）

## 安装

```bash
npm install @axolo/leosql
```

## 方法

### 1. 转换为MySQL

```js
leosql.qs2sql(qs, [ type = 'sql', [beauty = false] ])
```

### 参数

#### qs

查询参数

|    键     | 必须  |                              说明                              |
| --------- | :---: | -------------------------------------------------------------- |
| `_fields` |  否   | 字段，逗号分隔，**尽量由程序生成**                             |
| `_sets`   |  否   | 表，逗号分隔，**尽量由程序生成**                               |
| `*_eq`    |  否   | 等于，某个值或者以逗号分隔的多个值其中 * 为属性（字段）        |
| `*_ne`    |  否   | 不等于，其中 * 为属性（字段）                                  |
| `*_gt`    |  否   | 大于，其中 * 为属性（字段）                                    |
| `*_lt`    |  否   | 小于，其中 * 为属性（字段）                                    |
| `*_gte`   |  否   | 大于等于（不小于），其中 * 为属性（字段）                      |
| `*_lte`   |  否   | 小于等于（不大于），其中 * 为属性（字段）                      |
| `*_have`  |  否   | 含有，其中 * 为属性（字段）                                    |
| `*_start` |  否   | 开头含有，其中 * 为属性（字段）                                |
| `*_end`   |  否   | 结尾含有，其中 * 为属性（字段）                                |
| `_logic`  |  否   | 当前条件逻辑关系，可选`AND`或`OR`，未赋值、值错误均默认为`AND` |
| `_asc`    |  否   | 顺序，其值为逗号分隔的属性（字段）                             |
| `_desc`   |  否   | 逆序，其值为逗号分隔的属性（字段）                             |
| `_page`   |  否   | 分页的页码，正整数                                             |
| `_limit`  |  否   | 分页的单页记录数， 正整数，超限报错                            |
| `_q`      |  否   | 全文检索，对表进行全文搜索，建议独立使用                       |

> `条件` 和 `全文检索` 一般不会同时出现

> `_q` 全文检索功能尚未实现。


#### type

输出类型

|    值     |   类型   |             说明              |
| --------- | -------- | ----------------------------- |
| `sql`     | `string` | 默认，返回`MySQL`语句         |
| `count`   | `string` | 合计，返回`MySQL` `COUNT`语句 |
| `columns` | `array`  | 字段，返回查询和条件字段数组  |


#### beauty

是否美化`SQL`语句

|   值    |   类型    |      说明      |
| ------- | --------- | -------------- |
| `false` | `boolean` | 不美化（默认） |
| `true`  | `boolean` | 美化           |

#### 示例

```js
const leosql = require('@axolo/leosql')
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
```

```sql
-- 相当于生成如下 MySQL 语句
SELECT
  `id`,
  `name`,
  `mail`
FROM
  `accounts`
WHERE
  `spawned` >= '20190101'
  AND `spawned` <= '20190105'
  AND `destroied` IN('1', '0')
  OR `mail` like '%@mail.com'
ORDER BY
  `mail` ASC,
  `spawned` DESC,
  `modifyed` DESC
LIMIT
  40, 20;
```

> 方跃明
