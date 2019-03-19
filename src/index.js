const _  = require('lodash')
const SqlString = require('sqlstring')
const sqlFormatter = require('sql-formatter')

class LeoSQL {

  /**
   * **从QueryString对象生成SQL语句**
   *
   * @constructor
   * @param {Object} request  请求对象，一般为`qs.parse(QueryString)`
   * @param {Boolean} [beauty=false]  格式化SQL，美化SQL代码
   */
  constructor(request, beauty = false) {
    this.request = request
    this.beauty = beauty
  }

  /**
   * **获取表列表**
   *
   * @return {String|Array} 表列表
   * @memberof LeoSQL
   */
  getTable() {
    return this.request._table
  }

  /**
   * **获字段列表**
   *
   * @return {String|Array} 字段列表
   * @memberof LeoSQL
   */
  getColumn() {
    return this.request._column
  }

  /**
   * **获取值列表**
   *
   * @return {String|Array} 值列表
   * @memberof LeoSQL
   */
  getValue() {
    return this.request._value
  }

  /**
   * **获取条件列表和SQL语句**
   *
   * 组装了逻辑关系的 WHERE (SQL字符串)
   *
   * @return {Object} 条件列表，`{column: 条件字段数组, sql: 条件 SQL语句字符串}`
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
    const where = { column: [], items: [] }
    _.forIn(this.request, (value, key) => {
      const index = key.lastIndexOf('_')
      const operator = key.substring(index)
      if(operators.indexOf(operator) !== -1) {
        const column = key.substring(0, index)
        where.column.push(column)
        switch(operator) {
          case '_eq': {
            where.items.push([SqlString.escapeId(column), 'IN (', SqlString.escape(value), ')'].join(' '))
            break
          }
          case '_ne': {
            where.items.push([SqlString.escapeId(column), 'NOT IN (', SqlString.escape(value), ')'].join(' '))
            break
          }
          case '_gt': {
            where.items.push([SqlString.escapeId(column), '>', SqlString.escape(value)].join(' '))
            break
          }
          case '_lt': {
            where.items.push([SqlString.escapeId(column), '<', SqlString.escape(value)].join(' '))
            break
          }
          case '_gte': {
            where.items.push([SqlString.escapeId(column), '>=', SqlString.escape(value)].join(' '))
            break
          }
          case '_lte': {
            where.items.push([SqlString.escapeId(column), '<=', SqlString.escape(value)].join(' '))
            break
          }
          case '_have':
          case '_has': {
            where.items.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value + '%')].join(' '))
            break
          }
          case '_start': {
            where.items.push([SqlString.escapeId(column), 'like', SqlString.escape(value + '%')].join(' '))
            break
          }
          case '_end': {
            where.items.push([SqlString.escapeId(column), 'like', SqlString.escape('%' + value)].join(' '))
            break
          }
        }
      }
    })
    where.column = _.uniq(where.column)
    // 组装条件逻辑
    const logic = this.request._logic
    where.items.forEach((item, index) => {
      if(index) {
        let _logic = Array.isArray(logic) ? logic[index - 1] : logic
        _logic = _logic ? _logic.toUpperCase() : 'AND'
        _logic = ['AND', 'OR'].indexOf(_logic) === -1 ? 'AND' : _logic
        where.items[index] = [_logic, item].join(' ')
      }
    })
    const sql = _.isEmpty(where.items) ? '' : ('WHERE (' + where.items.join(' ') + ')')
    return { column: where.column, sql: sql }
  }

  /**
   * **获取条件字段列表**
   *
   * 相当于`getWhere().column`
   *
   * @return {Array} 条件字段列表
   * @memberof LeoSQL
   */
  getWhereColumn() {
    return this.getWhere().column
  }

  /**
   * **获取 `WHERE` SQL语句**
   *
   * 相当于`getWhere().sql`
   *
   * @return {String} 条件SQL语句
   * @memberof LeoSQL
   */
  where() {
    return this.getWhere().sql
  }

  /**
   * **获取偏移量**
   *
   * 相当于 `LIMIT m, n` 的 `n`
   *
   * @return {Number} 偏移量
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
   * 相当于 `LIMIT m, n` 的 `m`
   *
   * @return {Number} 偏移位置
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
   * **获取 `LIMIT` SQL语句**
   *
   * @return {String} LIMIT SQL字符串
   * @memberof LeoSQL
   */
  limit() {
    const limit = this.getLimit() ? 'LIMIT ' + [this.getOffset(), this.getLimit()].join() : ''
    return limit
  }

  /**
   * **获取 `ORDER BY` SQL语句**
   *
   * @return {String} 排序SQL字符串
   * @memberof LeoSQL
   */
  order() {
    // FIXME: ASC、DESC先后顺序
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
   * **获取 `INSERT` SQL语句**
   * @return {String} `INSERT` SQL语句
   * @memberof LeoSQL
   */
  insert() {
    if(_.isEmpty(this.getColumn())) return ''
    const sql = [
      'INSERT INTO ',
      SqlString.escapeId(this.getTable()),
      '(', SqlString.escapeId(this.getColumn()), ') VALUES (',
      SqlString.escape(this.getValue()), ')'].join(' ')
      if(this.beauty) return sqlFormatter.format(sql)
      return sql
  }

  /**
   * **获取 `SELECT` SQL语句**
   *
   * @return {String} `SELECT` SQL语句
   * @memberof LeoSQL
   */
  select() {
    const select = this.getColumn() ? ('SELECT ' + SqlString.escapeId(this.getColumn())) : ''
    const from = this.getTable() ? ('FROM ' + SqlString.escapeId(this.getTable())) : ''
    const where = this.where()
    const order = this.order()
    const limit = this.limit()
    const sql = [select, from, where, order, limit].join(' ')
    if(this.beauty) return sqlFormatter.format(sql)
    return sql
  }

  /**
   * **获取 `UPDATE` SQL语句**
   *
   * @return {String} `UPDATE` SQL语句
   * @memberof LeoSQL
   */
  update() {
    const columns = this.getColumn()
    if(_.isEmpty(columns)) return ''
    const values = this.getValue()
    const sets = []
    columns.forEach((column, index) => {
      sets.push([SqlString.escapeId(column), '=', SqlString.escape(values[index])].join(' '))
    })
    const sql = [
      'UPDATE', SqlString.escapeId(this.getTable()),
      'SET', sets.join(','),
      this.where()
    ].join(' ')
    if(this.beauty) return sqlFormatter.format(sql)
    return sql
  }

  /**
   * **获取 `DELETE` SQL语句**
   *
   * @return {String} `DELETE` SQL语句
   * @memberof LeoSQL
   */
  delete() {
    const from = this.getTable() ? ('FROM ' + SqlString.escapeId(this.getTable())) : ''
    const where = this.where()
    const sql = ['DELETE', from, where].join(' ')
    if(this.beauty) return sqlFormatter.format(sql)
    return sql
  }

  /**
   * **获取 `COUNT` SQL语句**
   *
   * @return {String} `COUNT` SQL语句
   * @memberof LeoSQL
   */
  count() {
    const select = 'SELECT COUNT(*) count'
    const from = this.getTable() ? ('FROM ' + SqlString.escapeId(this.getTable())) : ''
    const where = this.where()
    const sql = [select, from, where].join(' ')
    if(this.beauty) return sqlFormatter.format(sql)
    return sql
  }

}

module.exports = LeoSQL
