# LeoSQL

将`HTTP`的`querystring`或`body`转换为存储引擎（比如[MySQL]）能够理解和执行的格式，
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

|   请求    |     类型     |                         值                         |
| --------- | ------------ | -------------------------------------------------- |
| `_method` | 字符串或数组 | 方法，**尽量由程序生成**                           |
| `_table`  | 字符串或数组 | 表，**尽量由程序生成**                             |
| `_column` | 字符串或数组 | 列，**尽量由程序生成**                             |
| `_value`  | 字符串或数组 | 值，用于匹配`INSERT`和`UPDATE`时的`_column`        |
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

## 安装

```bash
npm install @axolo/leosql
```

## 方法

参见[LeoSQL文档]

## 示例

```js
const qs = require('qs')
const sqlFormatter = require('sql-formatter')
const leosql = require('../src')

const query = `_table=user\
&_column=id&_column=name&_column=mail\
&_value=ID&_value=NAME&_value=MAIL\
&spawned_gte=20190101&spawned_lte=20190105\
&name=guest&name_ne=admin&name_ne=root\
&destroied_eq=true&destroied_eq=false\
&mail_end=%40mail.com\
&_logic=and&_logic=and&_logic=or\
&_desc=spawned&_desc=modified&_asc=mail\
&_limit=20&_page=3`

const leo = leosql(qs.parse(query))

console.log(sqlFormatter.format(leo.select))
```

> 相当于生成如下 MySQL 语句

```sql
SELECT
  `id`,
  `name`,
  `mail`
FROM
  `user`
WHERE
  (`spawned` >= '20190101'
  AND `spawned` <= '20190105'
  AND `name` IN ('guest')
  AND `name` NOT IN ('admin', 'root')
  OR `destroied` IN ('true', 'false')
  AND `mail` like '%@mail.com')
ORDER BY
  `mail` ASC,
  `spawned` DESC,
  `modified` DESC
LIMIT
  40, 20
```

## 测试

```bash
yarn test
```

## 版本

### TODO

- 条件分组，考虑以括号分组条件，更加贴近SQL，避免产生错误。
- 排序先后顺序，考虑排序的先后顺序。

### 0.2.0

方法改为属性。

### 0.1.3

接受无需转义的请求。

### 0.1.2

更新引入方式，符合用户习惯。

### 0.1.1

更新`LIMIT`逻辑，避免`LIMIT 0, 0`。

### 0.1.0

重构，且不兼容`0.0.x`。

### 0.0.x

历史版本，不再维护。

[MySQL]: https://github.com/mysqljs/mysql
[LeoSQL文档]: https://axolo.github.io/leosql
