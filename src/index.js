const _  = require('lodash')
const SqlString = require('sqlstring')

class LeoSQL {

  /**
   * **处理请求**
   *
   * @constructor
   * @param {Object} request  请求对象，一般为`qs.parse(QueryString)`
   */
  constructor(request) {
    this.request = request
    const operators = ['_eq', '_ne', '_gt', '_lt', '_gte', '_lte', '_have', '_has', '_start', '_end']
    const ignore = ['_q', '_method', '_table', '_column', '_value', '_logic', '_desc', '_asc', '_limit', '_page']
    const where = { column: [], items: [] }
    _.forIn(this.request, (value, key) => {
      if(ignore.indexOf(key) === -1) {
        const index = key.lastIndexOf('_')
        const operator = key.substring(index)
        if(operators.indexOf(operator) > -1) {
          const column = key.substring(0, index)
          where.column.push(column)
          switch(operator) {
            case '_eq': { where.items.push([SqlString.escapeId(column), 'IN (', SqlString.escape(value), ')'].join(' ')); break }
            case '_ne': { where.items.push([SqlString.escapeId(column), 'NOT IN (', SqlString.escape(value), ')'].join(' ')); break }
            case '_gt': { where.items.push([SqlString.escapeId(column), '>', SqlString.escape(value)].join(' ')); break }
            case '_lt': { where.items.push([SqlString.escapeId(column), '<', SqlString.escape(value)].join(' ')); break }
            case '_gte': { where.items.push([SqlString.escapeId(column), '>=', SqlString.escape(value)].join(' ')); break }
            case '_lte': { where.items.push([SqlString.escapeId(column), '<=', SqlString.escape(value)].join(' ')); break }
            case '_have': { where.items.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value + '%')].join(' ')); break }
            case '_has': { where.items.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value + '%')].join(' ')); break }
            case '_start': { where.items.push([SqlString.escapeId(column), 'like', SqlString.escape(value + '%')].join(' ')); break }
            case '_end': { where.items.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value)].join(' ')); break }
          }
        } else {
          where.column.push(key)
          where.items.push([SqlString.escapeId(key), 'IN (', SqlString.escape(value), ')'].join(' '))
        }
      }
    })
    where.column = _.uniq(where.column)
    // 组装条件逻辑
    const logic = this.request._logic
    const logicOr = []
    const logicAnd = []
    where.items.forEach((item, index) => {
      // if(index) {
        let _logic = Array.isArray(logic) ? logic[index] : logic
        _logic = _logic ? _logic.toUpperCase() : 'AND'
        _logic = ['AND', 'OR'].indexOf(_logic) === -1 ? 'AND' : _logic
        if(_logic === 'OR') {
          logicOr.push(item)
        } else {
          logicAnd.push(item)
        }
      // }
    })
    const whereAll = []
    !_.isEmpty(logicOr) && whereAll.push('(' + logicOr.join(' OR ') + ')')
    !_.isEmpty(logicAnd) && whereAll.push(logicAnd.join(' AND '))
    const sql = _.isEmpty(whereAll) ? '' : 'WHERE ' + whereAll.join(' AND ')
    this.where = { column: where.column, sql: sql }
  }


  /**
   * SQL操作方法，默认`SELECT`
   *
   * @prop {String}
   * @memberof LeoSQL
   */
  get method() {
    return this.request._method || 'SELECT'
  }

  /**
   * 表，数据表名称
   *
   * @prop {String|Array}
   * @memberof LeoSQL
   */
  get table() {
    return this.request._table
  }

  /**
   * 被写入的列的列表，用于`UPDATE`和`INSERT`方法
   *
   * @prop {String|Array}
   * @memberof LeoSQL
   */
  get column() {
    return this.request._column
  }

  /**
   * 被写入的值的列表，用于`UPDATE`和`INSERT`方法
   *
   * @prop {String|Array}
   * @memberof LeoSQL
   */
  get value() {
    return this.request._value
  }

  /**
   * 条件包含的列名称列表
   *
   * @prop {String|Array}
   * @memberof LeoSQL
   */
  get whereColumn() {
    return this.where.column
  }

  /**
   * 请求的偏移量，相当于 `LIMIT m, n` 的 `n`
   *
   * @return {Number}
   * @memberof LeoSQL
   */
  get limit() {
    const _limit = parseInt(this.request._limit)
    const limit = _limit > 0 ? _limit : 0
    return limit
  }

  /**
   * 请求的起始位置，相当于 `LIMIT m, n` 的 `m`
   *
   * @return {Number}
   * @memberof LeoSQL
   */
  get offset() {
    const _page = parseInt(this.request._page)
    const page = _page > 0 ? _page : 1
    const limit = this.limit
    const offset = (page - 1) * limit
    return offset
  }

  /**
   * `WHERE`的`SQL`语句片段
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get whereSql() {
    return this.where.sql
  }

  /**
   * `LIMIT`的`SQL`语句片段
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get limitSql() {
    const limit = this.limit ? 'LIMIT ' + [this.offset, this.limit].join() : ''
    return limit
  }

  /**
   * `ORDER BY`的`SQL`语句片段
   *
   * @todo 区分先后顺序
   * @return {String}
   * @memberof LeoSQL
   */
  get orderSql() {
    const orders = []
    if(!_.isEmpty(this.request._asc)) {
      const asc = Array.isArray(this.request._asc) ? this.request._asc : [this.request._asc]
      _.each(asc, item => orders.push([SqlString.escapeId(item), 'ASC'].join(' ')))
    }
    if(!_.isEmpty(this.request._desc)) {
      const desc = Array.isArray(this.request._desc) ? this.request._desc : [this.request._desc]
      _.each(desc, item => orders.push([SqlString.escapeId(item), 'DESC'].join(' ')))
    }
    if(_.isEmpty(orders)) return ''
    return 'ORDER BY ' + orders.join()
  }

  /**
   * `INSERT`的`SQL`语句
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get insert() {
    if(_.isEmpty(this.column)) return ''
    const sql = [
      'INSERT INTO ',
      SqlString.escapeId(this.table),
      '(', SqlString.escapeId(this.column), ') VALUES (',
      SqlString.escape(this.value), ')'].join(' ')
      return sql
  }

  /**
   * `SELECT`的`SQL`语句
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get select() {
    const select = this.column ? ('SELECT ' + SqlString.escapeId(this.column)) : ''
    const from = this.table ? ('FROM ' + SqlString.escapeId(this.table)) : ''
    const where = this.whereSql
    const order = this.orderSql
    const limit = this.limitSql
    const sql = [select, from, where, order, limit].join(' ')
    return sql
  }

  /**
   * `UPDATE`的`SQL`语句
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get update() {
    const columns = this.column
    if(_.isEmpty(columns)) return ''
    const values = this.value
    const sets = []
    columns.forEach((column, index) => {
      sets.push([SqlString.escapeId(column), '=', SqlString.escape(values[index])].join(' '))
    })
    const sql = [
      'UPDATE', SqlString.escapeId(this.table),
      'SET', sets.join(','),
      this.whereSql
    ].join(' ')
    return sql
  }

  /**
   * `DELETE`的`SQL`语句
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get delete() {
    const from = this.table ? ('FROM ' + SqlString.escapeId(this.table)) : ''
    const where = this.whereSql
    const sql = ['DELETE', from, where].join(' ')
    return sql
  }

  /**
   * `COUNT`的`SQL`语句
   *
   * @return {String}
   * @memberof LeoSQL
   */
  get count() {
    const select = 'SELECT COUNT(*) count'
    const from = this.table ? ('FROM ' + SqlString.escapeId(this.table)) : ''
    const where = this.whereSql
    const sql = [select, from, where].join(' ')
    return sql
  }

}

module.exports = (request) => new LeoSQL(request)
