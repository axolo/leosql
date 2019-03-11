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

### qs2sql

将`QueryString`对象转换为`MySQL`语句或相关内容

```js
leosql.qs2sql({ query: object, method: string, beauty: boolean })
```

#### query

查询参数，由一组约定了格式的对象组成，用于被解析为`SQL`语句。

|    键     |     类型     |                         值                         |
| --------- | ------------ | -------------------------------------------------- |
| `_sets`   | 字符串或数组 | 表，**尽量由程序生成**                             |
| `_fields` | 字符串或数组 | 字段，**尽量由程序生成**                           |
| `_values` | 字符串或数组 | 值，用于匹配`INSERT`和`UPDATE`时的`_fields`        |
| `*_eq`    | 字符串或数组 | 等于，* 表示字段名                                 |
| `*_ne`    | 字符串或数组 | 不等于，* 表示字段名                               |
| `*_gt`    | 字符串       | 大于，* 表示字段名                                 |
| `*_lt`    | 字符串       | 小于，* 表示字段名                                 |
| `*_gte`   | 字符串       | 大于等于（不小于），* 表示字段名                   |
| `*_lte`   | 字符串       | 小于等于（不大于），* 表示字段名                   |
| `*_have`  | 字符串       | 含有，* 表示字段名                                 |
| `*_start` | 字符串       | 开头含有，* 表示字段名                             |
| `*_end`   | 字符串       | 结尾含有，* 表示字段名                             |
| `_logic`  | 字符串或数组 | 条件之间的逻辑关系，默认为AND。                    |
| `_asc`    | 字符串或数组 | 顺序                                               |
| `_desc`   | 字符串或数组 | 逆序                                               |
| `_page`   | 正整数       | 分页的页码                                         |
| `_limit`  | 正整数       | 分页的单页记录数                                   |
| `_q`      | 字符串       | 全文检索，对表进行全文搜索，建议独立使用（未实现） |

**其中`_logic`有`string`和`array`两种类型，类型不同解析方法也不同，具体如下：**

- `string`

  统一为各个条件匹配指定的关系。比如`_logic=or`，则所有条件之间的关系均为`OR`。

- `array`

  按`_logic`数组顺序逐一为各个条件匹配关系，条件结束匹配完成，数组超出的部分直接丢弃。
  数组长度不足时，后续未匹配到的条件关系均默认为`AND`。

#### method

输出类型，可选值，默认`select`。

|    值     | 输出格式 |              说明              |
| --------- | -------- | ------------------------------ |
| `select`  | `string` | 默认，返回`MySQL` `SELECT`语句 |
| `update`  | `string` | 更新，返回`MySQL` `UPDATE`语句 |
| `insert`  | `string` | 插入，返回`MySQL` `INSERT`语句 |
| `delete`  | `string` | 删除，返回`MySQL` `DELETE`语句 |
| `count`   | `string` | 合计，返回`MySQL` `COUNT`语句  |
| `columns` | `object` | 字段，返回查询、条件包含的字段 |
| `limit`   | `boject` | 范围，返回起始位置和查询行数  |

**当输出类型为`columns`时：**

- `request`：被`SELECT`、`UPDATE`、`INSERT`、`DELETE`语句请求字段
- `where`：`WHERE`条件包含的字段
- `all`：以上两者皆是

**当输出类型为`limit`时：**

- `offset`：本次查询的起始位置
- `limit`：本次查询约定的记录数

#### beauty

当输出为`SQL`语句时，是否美化`SQL`语句，可选值，默认`false`。

|   值    |   类型    |      说明      |
| ------- | --------- | -------------- |
| `false` | `boolean` | 不美化（默认） |
| `true`  | `boolean` | 美化           |

#### 示例

```js
const leosql = require('@axolo/leosql')
const query = {
  "_sets": "accounts",                   // 表（字符串或数组）
  "_fields": ["id", "name", "mail"],     // 字段（字符串或数组）
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
const sql = leosql.qs2sql({ query: query, method: 'select', beauty: true })
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
  AND `name` NOT IN ('admin', 'root')
  OR `destroied` IN (true, false)
  AND `mail` like '%@mail.com'
ORDER BY
  `mail` ASC,
  `spawned` DESC,
  `modified` DESC
LIMIT
  40, 20;
```

## 测试

```bash
yarn test
```

## 版本

### 0.0.7

- 实现`limit`

### 0.0.6

- `_logic`不为数组时，为所有条件插入相同的关系。如：`_logic=or`，所有条件之间的关系均为`OR`。

### 0.0.5

- `columns`分类

### 0.0.4

- 实现`insert`和`delete`

### 0.0.3

- 修正判断逻辑

### 0.0.2

- 遵循[qs](https://github.com/ljharb/qs)标准格式
- 实现`update`

### 0.0.1

- 以逗号分隔多个值
- 实现`select`、`count`和`columns`

> 方跃明
