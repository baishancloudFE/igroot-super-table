import React, { Component } from 'react'
import SuperTable from './IgrootSuperTable'


export default class App extends Component {
  constructor(props, context) {
    super(props, context)
    const rows = this.createRows(10)

    this.state = { rows, originalRows: rows }
  }

  columns = [
    {
      key: 'id',
      title: 'ID',
      width: 80,
      locked: true,
      filterable: false,
      resizable: false 
    },
    {
      key: 'sex',
      title: '性别',
      headerRenderer: () => {
        return <span color='red'>性别</span>
      }
    },
    {
      key: 'task',
      title: '标题',
      sortable: true,
      editable: true
    },
    {
      key: 'priority',
      name: '优先级',
      sortable: true,
      editor: {
        type: 'select',
        options:[
          { 
            value: 0, 
            label: 'Critical' 
          }, 
          { 
            value: 1, 
            label: 'High' 
          }, 
          { 
            value: 2, 
            label: 'Medium' 
          }, 
          { 
            value: 3, 
            label: 'Low'
          } 
        ]
      },
      resizable: false
    },
    {
      key: 'issueType',
      name: 'Issue Type',
      editor: {
        type: 'autoComplete',
        options:[
          { 
            value: 0, 
            label: 'Critical' 
          }, 
          { 
            value: 1, 
            label: 'High' 
          }, 
          { 
            value: 2, 
            label: 'Medium' 
          }, 
          { 
            value: 3, 
            label: 'Low'
          } 
        ]
      },
      editable: true
    },
    {
      key: 'complete',
      name: 'Complete(%)',
      editable: true,
      render: (text, record) => {
        return <div>{text}%</div>
      }
    },
    {
      key: 'startDate',
      name: 'Start Date',
      editable: true
    },
    {
      key: 'completeDate',
      name: 'Expected Complete',
      editable: true
    }
  ]

  menus = [
    {
      title: '删除',
      callback: (e, { rowIdx }) => {
        this.state.rows.splice(rowIdx, 1);
        this.setState({rows: this.state.rows});
      }
    },
    {
      title: '插入',
      children: [
        {
          title: '前行',
          callback: (e, { rowIdx }) => {
            this.insertRow(rowIdx)
          }
        },
        {
          title: '后行',
          callback: (e, { rowIdx }) => {
            this.insertRow(rowIdx + 1)
          }
        }
      ]
    }
  ]

  insertRow = (rowIdx) => {
    const newRow = {
      id: 0,
      sex: 1,
      task: 'Task',
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ['Critical', 'High', 'Medium', 'Low'][Math.floor((Math.random() * 3) + 1)],
      issueType: ['Bug', 'Improvement', 'Epic', 'Story'][Math.floor((Math.random() * 3) + 1)],
      startDate: this.getRandomDate(new Date(2015, 3, 1), new Date()),
      completeDate: this.getRandomDate(new Date(), new Date(2016, 0, 1))
    }

    let rows = [...this.state.rows]
    rows.splice(rowIdx, 0, newRow)

    this.setState({ rows })
  }

  getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
  }

  createRows = (numberOfRows) => {
    let rows = [];
    for (let i = 1; i < numberOfRows; i++) {
      rows.push({
        id: i,
        sex: ['男', '女'][i%2],
        task: 'Task ' + i,
        complete: Math.min(100, Math.round(Math.random() * 110)),
        priority: ['Critical', 'High', 'Medium', 'Low'][Math.floor((Math.random() * 3) + 1)],
        issueType: ['Bug', 'Improvement', 'Epic', 'Story'][Math.floor((Math.random() * 3) + 1)],
        startDate: this.getRandomDate(new Date(2015, 3, 1), new Date()),
        completeDate: this.getRandomDate(new Date(), new Date(2016, 0, 1))
      });
    }
    return rows
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
      } else if (sortDirection === 'DESC') {
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
      }
    };

    const rows = sortDirection === 'NONE' ? this.state.originalRows.slice(0) : this.state.rows.sort(comparer);

    this.setState({ rows });
  }
  
  handleRowUpdate = (value, row) => {
    console.log(value, row, 'RowUpdate')
  }

  handleRowSelected = (keys, row) => {
    console.log(keys, row, 'RowSelected')
  }

  handleChange = (data) => {
    console.log(data, 'change')
  }

  render() {
    return (
      <SuperTable 
        menus={this.menus}
        // group={[{key: 'sex', name:'性别'}, {key: 'priority', name:'优先级'}]}
        minHeight={1000}
        selectedRows={[0,1,3]}
        columnsFilterable={true}
        onChange={this.handleChange}
        onGridSort={this.handleGridSort}
        onRowUpdate={this.handleRowUpdate}
        onRowSelected={this.handleRowSelected}
        columns={this.columns}
        dataSource={this.state.rows}
      />
    )
  }
} 