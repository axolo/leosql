const _  = require('lodash')
const SqlString = require('sqlstring')
const sqlFormatter = require('sql-formatter')

class LeoSQL {

  /**
   * Creates an instance of LeoSQL.
   * @constructor
   * @param {object} request  请求对象，一般为`qs.parse(QueryString)`
   */
  constructor(request) {
    this.request = request
    this.beauty = true
  }

  /**
   * **获取表列表**
   *
   * @return {string|array} 表列表
   * @memberof LeoSQL
   */
  getTable() {
    return this.request._table
  }

  /**
   * **获字段列表**
   *
   * @return {string|array} 字段列表
   * @memberof LeoSQL
   */
  getColumn() {
    return this.request._column
  }

  /**
   * **获取值列表**
   *
   * @return {string|array} 值列表
   * @memberof LeoSQL
   */
  getValue() {
    return this.request._value
  }

  /**
   * **获取条件列表**
   *
   * 组装了逻辑关系的 WHERE (SQL字符串)
   *
   * @return {object} 条件列表，`{column: 条件字段数组, sql: 条件SQL语句字符串}`
   * @memberof LeoSQL
   */
  getWhere() {
    const operators = [
      '_eq',
      '_ne',
      '_gt',
      '_lt',
      '_gte',
      '_lte',
      '_have',
      '_has',
      '_start',
      '_end'
    ]
    const where = { column: [], sql: [] }
    _.forIn(this.request, (value, key) => {
      const index = key.lastIndexOf('_')
      const operator = key.substring(index)
      if(operators.indexOf(operator) !== -1) {
        const column = key.substring(0, index)
        where.column.push(column)
        switch(operator) {
          case '_eq': {
            where.sql.push([SqlString.escapeId(column), 'IN (', SqlString.escape(value), ')'].join(' '))
            break
          }
          case '_ne': {
            where.sql.push([SqlString.escapeId(column), 'NOT IN (', SqlString.escape(value), ')'].join(' '))
            break
          }
          case '_gt': {
            where.sql.push([SqlString.escapeId(column), '>', SqlString.escape(value)].join(' '))
            break
          }
          case '_lt': {
            where.sql.push([SqlString.escapeId(column), '<', SqlString.escape(value)].join(' '))
            break
          }
          case '_gte': {
            where.sql.push([SqlString.escapeId(column), '>=', SqlString.escape(value)].join(' '))
            break
          }
          case '_lte': {
            where.sql.push([SqlString.escapeId(column), '<=', SqlString.escape(value)].join(' '))
            break
          }
          case '_have':
          case '_has': {
            where.sql.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value + '%')].join(' '))
            break
          }
          case '_start': {
            where.sql.push([SqlString.escapeId(column), 'like', SqlString.escape(value + '%')].join(' '))
            break
          }
          case '_end': {
            where.sql.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value)].join(' '))
            break
          }
        }
      }
    })
    where.column = _.uniq(where.column)
    return where
  }

  /**
   * **获偏移量**
   *
   * @return {number} 偏移量
   * @memberof LeoSQL
   */
  getLimit() {
    const _limit = parseInt(this.request._limit)
    const limit = _limit > 0 ? _limit : 0
    return limit
  }

  /**
   * **获取偏移位置**
   *
   * @return {number} 偏移位置
   * @memberof LeoSQL
   */
  getOffset() {
    const _page = parseInt(this.request._page)
    const page = _page > 0 ? _page : 1
    const limit = this.getLimit()
    const offset = (page - 1) * limit
    return offset
  }

  /**
   * **获取排序SQL**
   *
   * @return {string} 排序SQL字符串
   * @memberof LeoSQL
   */
  getOrder() {
    // FIXME: ASC、DESC先后顺序
    const orders = []
    const asc = Array.isArray(this.request._asc) ? this.request._asc : [this.request._asc]
    asc && _.each(asc, item => orders.push([SqlString.escapeId(item), 'ASC'].join(' ')))
    const desc = Array.isArray(this.request._desc) ? this.request._desc : [this.request._desc]
    desc && _.each(desc, item => orders.push([SqlString.escapeId(item), 'DESC'].join(' ')))
    return orders
  }

  /**
   * **获取`SQL INSERT`语句**
   * @return 返回`SQL INSERT`语句
   * @memberof LeoSQL
   */
  sqlInsert() {
    return
  }

  /**
   * **获取`SQL SELECT`语句**
   *
   * @return 返回`SQ SELECT`语句
   * @memberof LeoSQL
   */
  sqlSelect() {
    const sql = [
      'SELECT',
      SqlString.escapeId(this.getColumn()),
      'FROM',
      SqlString.escapeId(this.getTable())
    ].join(' ')
    return this.beauty ? sqlFormatter.format(sql) : sql
  }

  /**
   * **获取`SQL UPDATE`语句**
   *
   * @return 返回`SQ UPDATE`语句
   * @memberof LeoSQL
   */
  sqlUpdate() {

  }

  /**
   * **获取`SQL DELETE语句**
   *
   * @return 返回`SQ DELETE`语句
   * @memberof LeoSQL
   */
  sqlDelete() {

  }

  /**
   * **获取`SQL COUNT`语句**
   *
   * @return 返回`SQ COUNT`语句
   * @memberof LeoSQL
   */
  sqlCount() {

  }

}

module.exports = LeoSQL
