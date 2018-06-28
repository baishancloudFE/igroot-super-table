import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './IgrootSuperTable.css'

import update from 'immutability-helper'
import SuperTable from 'react-data-grid'
import { Editors, Formatters, Toolbar, Data, Menu, ToolsPanel, Draggable } from 'react-data-grid-addons'
import { formatAutoCompleteOptions, formatSelectOptions, formatterWrapper } from './transform'

import { IgrootSuperTableMenu } from './IgrootSuperTableMenu'

const { Selectors } = Data 
const { ContextMenu, MenuItem, SubMenu } = Menu
const { AdvancedToolbar, GroupedColumnsPanel } = ToolsPanel
const { AutoComplete: AutoCompleteEditor, DropDownEditor, CheckBoxEditor } = Editors
const { DropDownFormatter } = Formatters
const { Container: DraggableContainer } = Draggable

const menuId = `SuperTableMenu-${new Date().getTime()}`

export default class IgrootSuperTable extends Component {
  static displayName = 'IgrootSuperTable'

  static propTypes = {
    dataSource: PropTypes.array,
    columns: PropTypes.array,
    menus: PropTypes.array,
    group: PropTypes.array,
    selectedRows: PropTypes.array,
    minHeight: PropTypes.number,
    enableCellSelect: PropTypes.bool,
    enableGroup: PropTypes.bool,
    columnsResizable: PropTypes.bool,
    columnsSortable: PropTypes.bool,
    columnsFilterable: PropTypes.bool,
    onRowUpdate: PropTypes.func,
    onChange: PropTypes.func,
    onRowSelected: PropTypes.func
  }

  static defaultProps = {
    dataSource: [],
    columns: [],
    menus: [],
    group:[],
    selectedRows: [],
    minHeight: 400,
    enableCellSelect: false,
    enableGroup: false,
    columnsResizable: true,
    columnsSortable: false,
    columnsFilterable: false,
    onRowUpdate: () => {},
    onChange:  () => {},
    onRowSelected: null
  }

  constructor(props) {
    super(props)

    const { 
      dataSource, 
      columns,
      menus, 
      group,
      selectedRows,
      enableCellSelect, 
      columnsResizable,
      columnsSortable,
      columnsFilterable  
    } = props 

    this.enableCellSelect = enableCellSelect
    this.columnsFilterable = columnsFilterable
    this.columns = columns
    this.columns.map(item => {
      if (item['title']) 
        item['name'] = item['title']

      if (item['editable'] && !this.enableCellSelect) {
        this.enableCellSelect = true
      } 

      item['dataIndex'] = item['key']

      if(item['editor'] && item['editor']['type']) {
        item['editor'] = this.setEditorComponentByType(item['editor'])
      }

      if (columnsResizable　&& item['resizable'] === undefined) 
        item['resizable'] = columnsResizable

      if (columnsSortable && item['sortable'] === undefined) 
        item['sortable'] = columnsSortable
      
      if (columnsFilterable && item['filterable'] === undefined)
        item['filterable'] = columnsFilterable 
       
      if (!this.columnsFilterable && item['filterable'])  
        this.columnsFilterable = true 

      if (item['render']) {
        const FormatterWrapper = formatterWrapper(item['render'], dataSource)
        item['formatter'] = <FormatterWrapper />
      }
    })

    dataSource.map((item, index) => item['_id_']=index)

    this.state = {
      rows: dataSource,
      dataSource,
      filters: {},
      selectedRows,
      expandedRows: {},
      groupBy: group
    }
  }

  activeEditor = false

  componentWillReceiveProps(nextProps) {
    if ('dataSource' in nextProps) {
      const { dataSource } = nextProps
      this.columns.map(item => {
        if (item['render']) {
          const FormatterWrapper = formatterWrapper(item['render'], dataSource)
          item['formatter'] = <FormatterWrapper />
        }
      })
      
      dataSource.map((item, index) => item['_id_']=index)

      this.setState({
        rows: dataSource,
        dataSource,
        groupBy: nextProps['group'] || []
      })
    }
  }

  dataChange = () => {
    const { onChange } = this.props 
    const { dataSource } = this.state 

    onChange && onChange(dataSource)
  }

  getDataSource = () => {
    return Selectors.getRows(this.state)
  } 

  setEditorComponentByType = (editor) => {
    const { type, options } = editor

    if (type === 'select') return <DropDownEditor options={formatSelectOptions(options)}/>
    if (type === 'autoComplete') return <AutoCompleteEditor options={formatAutoCompleteOptions(options)} />
    // if (type === 'checkbox') return <CheckBoxEditor options={options} />
  }

  handleGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    const { onRowUpdate, onChange } = this.props 
    const originRows = this.getDataSource()

    let rows = originRows.slice()
    let updatedRow = null

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i]
      updatedRow = update(rowToUpdate, {$merge: updated})
      rows[i] = updatedRow 
    }

    rows = rows.filter(item => item._id_!==undefined)

    onRowUpdate && onRowUpdate(updated, updatedRow)
    onChange && onChange(rows)


    this.setState({ 
      rows,
      dataSource: rows
    })
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const { dataSource } = this.state 
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1
      } else if (sortDirection === 'DESC') {
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1
      }
    }
    const rows = sortDirection === 'NONE' ? dataSource.slice(0) : dataSource.sort(comparer)

    this.setState({
      dataSource: rows 
    })
  }

  handleFilterAdd = (filter) => {
    let newFilters = Object.assign({}, this.state.filters)
    if (filter.filterTerm) {
        newFilters[filter.column.key] = filter
    } else {
        delete newFilters[filter.column.key]
    }
    this.setState({
        filters: newFilters
    })
  }


  handleClearFilters = () => {
    this.setState({
        filters: {}
    })
  }

  handleRowsSelected = (rows) => {
    const { onRowSelected } = this.props 
    const { selectedRows } = this.state 
    const newSelectedRows = selectedRows.concat(rows.map(r => r.row._id_))

    this.setState({
      selectedRows: newSelectedRows
    })

    onRowSelected && onRowSelected(newSelectedRows, rows[0].row)
  }

  handleRowsDeselected = (rows) => {
    const { onRowSelected } = this.props 
    const { selectedRows } = this.state 
    const  rowIndexes = rows.map(r => r.row._id_)
    const newSelectedRows = selectedRows.filter(i => rowIndexes.indexOf(i) === -1)

    this.setState({
      selectedRows: newSelectedRows
    })

    onRowSelected && onRowSelected(newSelectedRows, rows[0].row)
  }

  handleRowExpandToggle = ({ columnGroupName, name, shouldExpand }) => {
    let expandedRows = Object.assign({}, this.state.expandedRows)

    expandedRows[columnGroupName] = Object.assign({}, expandedRows[columnGroupName])
    expandedRows[columnGroupName][name] = {isExpanded: shouldExpand}

    this.setState({ expandedRows })
  }

  handleColumnGroupAdded = (colName) => {
    const { groupBy } = this.state 
    let columnGroups = groupBy.slice(0)
    let activeColumn = this.columns.find((c) => c.key === colName)
    let isNotInGroups = columnGroups.find((c) => activeColumn.key === c.name) == null
    if (isNotInGroups) {
      columnGroups.push({ key: activeColumn.key, name: activeColumn.name })
    }
   
    this.setState({ groupBy: columnGroups })
  }

  handleColumnGroupDeleted = (name) => {
    let columnGroups = this.state.groupBy.filter(function(g){
      return typeof g === 'string' ? g !== name : g.key !== name
    })
    this.setState({groupBy: columnGroups})
  }

  handleCheckCellIsEditable = ({ active }) => {
    this.activeEditor = !!active
  }

  rowGetter = (i) => {
    const { dataSource } = this.state 
    const  dataSource1 = this.getDataSource()

    return dataSource1[i]
  }

  emptyEmptyView = () => {
    return (
      <div className="table-empty">
        <span className="empty-content">
          <span className="iconfont icon-empty" />
          无数据
        </span>
      </div>
    )
  }

  rowGroupRenderer = (data) => {
    const { groupBy } = this.state 
    const { columnGroupName, columns, name, isExpanded, treeDepth } = data 
    const groupName = groupBy.find(item => item.key === columnGroupName)['name']
    const shouldExpand = !isExpanded
    const params = { columnGroupName, name, shouldExpand }
    const iconCls = shouldExpand ? 'icon-up' : 'icon-down'

    return (
      <div 
        onClick={() => this.handleRowExpandToggle(params)} 
        className={`igroot-group-render bg-color-${treeDepth}`}
        style={{paddingLeft: treeDepth*20 + 10}}
      >
      <span className={`iconfont ${iconCls}`} />
      {`${groupName}：${name}`}
      </div>
    )
  }

  render() {
    const  dataSource = this.getDataSource() 
    const { selectedRows, groupBy } = this.state 
    const { className, style, minHeight, onRowSelected, menus, enableGroup } = this.props 
    const isEmpty = !dataSource.length
    const extraProps = {}

    if (onRowSelected) {
      extraProps['rowSelection'] = {
        showCheckbox: true,
        enableShiftSelect: true,
        onRowsSelected: this.handleRowsSelected,
        onRowsDeselected: this.handleRowsDeselected,
        selectBy: {
          keys: {
            rowKey: '_id_',
            values: selectedRows
           }
         }
      }
    }

    if (menus.length) {
      extraProps['contextMenu'] = (
        <IgrootSuperTableMenu options={menus} id={menuId} />
      )
    }

    if (this.columnsFilterable || (enableGroup &&groupBy.length)) {
      extraProps['toolbar'] = (
        <Toolbar enableFilter={this.columnsFilterable} filterRowsButtonText="快速过滤">
        {
          enableGroup && <GroupedColumnsPanel
            groupBy={groupBy} 
            onColumnGroupAdded={this.handleColumnGroupAdded} 
            onColumnGroupDeleted={this.handleColumnGroupDeleted}
          />
        }
      </Toolbar>
      )
    }

    return (
        <div className={`igroot-super-table ${className || ''}`} style={style}>
          <DraggableContainer>
            <SuperTable 
              ref={ node => this.grid = node }
              emptyRowsView={this.emptyEmptyView}
              rowGroupRenderer={this.rowGroupRenderer}              
              onGridSort={this.handleGridSort}
              enableDragAndDrop={false}
              {...this.props} 
              {...extraProps}
              minHeight={isEmpty ? 0 : minHeight}
              onCheckCellIsEditable={this.handleCheckCellIsEditable}
              onAddFilter = {this.handleFilterAdd}
              onClearFilters = {this.handleClearFilters}
              onRowExpandToggle={this.handleRowExpandToggle}
              onGridRowsUpdated={this.handleGridRowsUpdated}
              columns={this.columns}
              rowsCount={dataSource.length}
              rowGetter={this.rowGetter}
              enableCellSelect={this.enableCellSelect}
            />
          </DraggableContainer>
        </div>
    )
  }
}
