const _  = require('lodash')
const SqlString = require('sqlstring')
const sqlFormatter = require('sql-formatter')

/**
 * **LeoSQL**
 *
 * Generate MySQL from qs.parse(Querystring).
 *
 * @class LeoSQL
 */
class LeoSQL {

  constructor(request) {
    this.request = request
    this.beauty = true
  }

  /**
   * **传统QueryString转LeoSQL格式**
   *
   * 非强制使用LeoSQL生成SQL，用于RBA要判断授权情况
   *
   * @param {array} includes 被包含的属性必须转为LeoSQL格式，避免漏判
   * @param {array} excludes 被排除的属性不转换为LeoSQL格式，避免误判
   * @memberof LeoSQL
   */
  toLeosql(includes, excludes) {
    return { includes: includes, excludes: excludes }
  }

  fromLeosql() {

  }

  getTables() {
    return this.request._tables
  }

  getFields() {
    return this.request._fields
  }

  getValues() {
    return this.request._values
  }

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
    const where = { fields: [], sqls: [] }
    _.forIn(this.request, (value, key) => {
      const index = key.lastIndexOf('_')
      const operator = key.substring(index)
      if(operators.indexOf(operator) !== -1) {
        const field = key.substring(0, index)
        where.fields.push(field)
        switch(operator) {
          case '_eq': {
            where.sqls.push([SqlString.escapeId(field), 'IN (', SqlString.escape(value), ')'].join(' '))
            break
          }
          case '_ne': {
            where.sqls.push([SqlString.escapeId(field), 'NOT IN (', SqlString.escape(value), ')'].join(' '))
            break
          }
          case '_gt': {
            where.sqls.push([SqlString.escapeId(field), '>', SqlString.escape(value)].join(' '))
            break
          }
          case '_lt': {
            where.sqls.push([SqlString.escapeId(field), '<', SqlString.escape(value)].join(' '))
            break
          }
          case '_gte': {
            where.sqls.push([SqlString.escapeId(field), '>=', SqlString.escape(value)].join(' '))
            break
          }
          case '_lte': {
            where.sqls.push([SqlString.escapeId(field), '<=', SqlString.escape(value)].join(' '))
            break
          }
          case '_have':
          case '_has': {
            where.sqls.push([SqlString.escapeId(field), 'like', SqlString.escape('%' + value + '%')].join(' '))
            break
          }
          case '_start': {
            where.sqls.push([SqlString.escapeId(field), 'like', SqlString.escape(value + '%')].join(' '))
            break
          }
          case '_end': {
            where.sqls.push([SqlString.escapeId(field), 'like', SqlString.escape('%' + value)].join(' '))
            break
          }
        }
      }
    })
    where.fields = _.uniq(where.fields)
    return where
  }

  getLogic() {
    const logic = this.request._logic
    return logic
  }

  getLimit() {
    const _limit = parseInt(this.request._limit)
    const limit = _limit > 0 ? _limit : 0
    return limit
  }

  getOffset() {
    const _page = parseInt(this.request._page)
    const page = _page > 0 ? _page : 1
    const limit = this.getLimit()
    const offset = (page - 1) * limit
    return offset
  }

  getOrder() {
    // FIXME: ASC、DESC先后顺序
    const orders = []
    const asc = Array.isArray(this.request._asc) ? this.request._asc : [this.request._asc]
    asc && _.each(asc, item => orders.push([SqlString.escapeId(item), 'ASC'].join(' ')))
    const desc = Array.isArray(this.request._desc) ? this.request._desc : [this.request._desc]
    desc && _.each(desc, item => orders.push([SqlString.escapeId(item), 'DESC'].join(' ')))
    return orders
  }

  sqlInsert() {

  }

  sqlSelect() {
    const sql = [
      'SELECT',
      SqlString.escapeId(this.getFields()),
      'FROM',
      SqlString.escapeId(this.getTables())
    ].join(' ')
    return this.beauty ? sqlFormatter.format(sql) : sql
  }

  sqlUpdate() {

  }

  sqlDelete() {

  }

  sqlCount() {

  }

}

module.exports = LeoSQL
