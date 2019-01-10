module.exports = {
  qs2sql: (query, type = 'sql', beauty = false) => {
    const _ = require('lodash')
    const SqlString = require('sqlstring')
    const sqlFormatter =  require('sql-formatter')
    const fields = []
    let sql = []
    let select = []
    let from = []
    let where = []
    let order = []
    let limit = ''
    let operator = ''
    let expression = ''
    let index = -1
    let column = ''
    let logic = []
    let page = 1
    let rows = 10    // 默认行数
    // 解析 ---------------------------------------------------------------------
    _.forIn(query, (value, key) => {
      index = key.lastIndexOf('_')
      operator = key.substring(index)
      column = key.substring(0, index)
      column && fields.push(column)
      column && (column = SqlString.escapeId(column))
      switch(operator) {
        default: {
          break
        }
        // SELECT
        case '_fields': {
          _.each(query._fields.split(','), item => {
            fields.push(item)
            select.push(item = SqlString.escapeId(item))
          })
          break
        }
        // DISTINCT <select_list>
        // FROM <left_table>
        case '_sets': {
          _.each(query._sets.split(','), item => {
            from.push(item = SqlString.escapeId(item))
          })
          break
        }
        // <join_type> JOIN <right_table>
        // ON <join_condition>
        // WHERE <where_condition>
        case '_eq': {
          const eq = []
          _.each(value.split(','), item => { eq.push(SqlString.escape(item)) })
          expression = [column, 'IN(', eq.join(','), ')'].join(' ')
          where.push(expression)
          break
        }
        case '_ne': {
          expression = [column, '<>', SqlString.escape(value)].join(' ')
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
        case '_have': {
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
          const asc = value.split(',')
          _.each(asc, item => { order.push(item = SqlString.escapeId(item) + ' ASC') })
          break
        }
        case '_desc': {
          const desc = value.split(',')
          _.each(desc, item => { order.push(item = SqlString.escapeId(item) + ' DESC') })
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
          logic = query._logic.toUpperCase().split(',')
          break
        }
      }
    })
    // 拼接 ---------------------------------------------------------------------
    from = from.length ? ['FROM', from.join(',')].join(' ') : ''
    where.forEach((item, index) => {
      index && (where[index] = [['AND', 'OR'].indexOf(logic[index - 1]) === -1 ? 'AND' : logic[index - 1], item].join(' '))
    })
    where = where.length ? ['WHERE', where.join(' ')].join(' ') : ''
    type = type && type.toLowerCase()
    switch(type) {
      default: {
        select = select.length ? ['SELECT', select.join(', ')].join(' ') : ''
        order = order.length ? ['ORDER BY', order.join(',')].join(' ') : ''
        const offset = (page - 1) * rows
        limit = limit || `LIMIT ${offset}, ${rows}`
        sql.push(select, from, where, order, limit)
        break
      }
      case 'count': {
        sql.push('SELECT COUNT(*) ' + SqlString.escapeId(type), from, where)
        break
      }
      case 'columns': {
        return _.uniq(fields)
      }
    }
    sql = sql.join(' ') + ';'
    sql = beauty ? sqlFormatter.format(sql) : sql
    return sql
  }
}
