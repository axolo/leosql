module.exports = {
  qs2sql: (params) => {
    const _ = require('lodash')
    const SqlString = require('sqlstring')
    const sqlFormatter =  require('sql-formatter')
    const operators = ['_eq', '_ne', '_gt', '_lt', '_gte', '_lte', '_have', '_has', '_start', '_end']
    const query = params.query
    const method = params.method ? params.method.toLowerCase() : 'select'
    const beauty = Boolean(params.beauty)
    const fieldsRequest = []
    const fieldsWhere = []
    const values = []
    let sql = []
    let columns = []
    let tables = []
    let where = []
    let orders = []
    let limit = ''
    let page = 0
    let rows = 0
    let operator = ''
    let expression = ''
    let index = -1
    let column = ''
    let logic = []
    // 解析 ---------------------------------------------------------------------
    _.forIn(query, (value, key) => {
      index = key.lastIndexOf('_')
      operator = key.substring(index)
      column = key.substring(0, index)
      operators.indexOf(operator) !== -1 && fieldsWhere.push(column)
      column && (column = SqlString.escapeId(column))
      switch(operator) {
        default: {
          break
        }
        // UPDATE
        case '_values': {
          const _values = Array.isArray(query._values) ? query._values : [query._values]
          _.each(_values, item => {
            values.push(SqlString.escape(item))
          })
          break
        }
        // SELECT
        case '_fields': {
          const _fields = Array.isArray(query._fields) ? query._fields : [query._fields]
          _.each(_fields, item => {
            fieldsRequest.push(item)
            columns.push(SqlString.escapeId(item))
          })
          break
        }
        // DISTINCT <select_list>
        // FROM <left_table>
        case '_sets': {
          const _sets = Array.isArray(query._sets) ? query._sets : [query._sets]
          _.each(_sets, item => { tables.push(SqlString.escapeId(item)) })
          break
        }
        // <join_type> JOIN <right_table>
        // ON <join_condition>
        // WHERE <where_condition>
        case '_eq': {
          const eq = []
          const _value = Array.isArray(value) ? value : [value]
          _.each(_value, item => { eq.push(SqlString.escape(item)) })
          expression = [column, 'IN (', eq.join(','), ')'].join(' ')
          where.push(expression)
          break
        }
        case '_ne': {
          const ne = []
          const _value = Array.isArray(value) ? value : [value]
          _.each(_value, item => { ne.push(SqlString.escape(item)) })
          expression = [column, 'NOT IN (', ne.join(','), ')'].join(' ')
          where.push(expression)
          break
        }
        case '_gt': {
          expression = [column, '>', SqlString.escape(value)].join(' ')
          where.push(expression)
          break
        }
        case '_lt': {
          expression = [column, '<', SqlString.escape(value)].join(' ')
          where.push(expression)
          break
        }
        case '_gte': {
          expression = [column, '>=', SqlString.escape(value)].join(' ')
          where.push(expression)
          break
        }
        case '_lte': {
          expression = [column, '<=', SqlString.escape(value)].join(' ')
          where.push(expression)
          break
        }
        case '_have':
        case '_has': {
          expression = [column, 'like', SqlString.escape('%' + value + '%')].join(' ')
          where.push(expression)
          break
        }
        case '_start': {
          expression = [column, 'like', SqlString.escape(value + '%')].join(' ')
          where.push(expression)
          break
        }
        case '_end': {
          expression = [column, 'like', SqlString.escape('%' + value)].join(' ')
          where.push(expression)
          break
        }
        // GROUP BY <group_by_list>
        // HAVING <having_condition>
        // ORDER BY <order_by_condition>
        case '_asc': {
          const _asc = Array.isArray(query._asc) ? query._asc : [query._asc]
          _.each(_asc, item => { orders.push(SqlString.escapeId(item) + ' ASC') })
          break
        }
        case '_desc': {
          const _desc = Array.isArray(query._desc) ? query._desc : [query._desc]
          _.each(_desc, item => { orders.push(SqlString.escapeId(item) + ' DESC') })
          break
        }
        // LIMIT <limit_number>
        case '_page': {
          page = parseInt(query._page)
          break
        }
        case '_limit': {
          rows = parseInt(query._limit)
          break
        }
        case '_logic': {
          logic = query._logic
          break
        }
      }
    })
    // 拼接 ---------------------------------------------------------------------
    where.forEach((item, index) => {
      if(index) {
        let _logic = Array.isArray(logic) ? logic[index - 1] : logic
        _logic = _logic ? _logic.toUpperCase() : 'AND'
        _logic = ['AND', 'OR'].indexOf(_logic) === -1 ? 'AND' : _logic
        where[index] = [_logic, item].join(' ')
      }
    })
    where = where.length ? ['WHERE', where.join(' ')].join(' ') : ''
    switch(method) {
      default:
      case 'select': {
        const select = columns.length ? ['SELECT', columns.join(', ')].join(' ') : ''
        const from = tables.length ? ['FROM', tables.join(',')].join(' ') : ''
        const order = orders.length ? ['ORDER BY', orders.join(',')].join(' ') : ''
        if(rows) {
          page = page ? page : 1
          const offset = (page - 1) * rows
          limit = limit || [`LIMIT`, [offset, rows].join(', ')].join(' ')
        }
        sql.push(select, from, where, order, limit)
        break
      }
      case 'count': {
        const from = tables.length ? ['FROM', tables.join(',')].join(' ') : ''
        sql.push('SELECT COUNT(*) `count`', from, where)
        break
      }
      case 'update': {
        const update = []
        _.each(columns, (column, index) => {
          update.push([column, '=', values[index]].join(' '))
        })
        const table = tables.length ? tables.join(',') : ''
        sql.push('UPDATE', table, 'SET', update.join(', '), where)
        break
      }
      case 'insert': {
        const table = tables.length ? tables.join(',') : ''
        sql.push('INSERT INTO', table, '(', columns.join(', ') , ') VALUES (', values.join(', ') ,')')
        break
      }
      case 'delete': {
        const from = tables.length ? ['FROM', tables.join(',')].join(' ') : ''
        sql.push('DELETE', from, where)
        break
      }
      case 'columns': {
        return {
          request: _.uniq(fieldsRequest),
          where: _.uniq(fieldsWhere),
          all: _.uniq(_.concat(fieldsRequest, fieldsWhere))
        }
      }
    }
    sql = sql.join(' ') + ';'
    sql = beauty ? sqlFormatter.format(sql) : sql
    return sql
  }
}
