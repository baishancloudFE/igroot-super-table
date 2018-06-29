
import React, { Component } from 'react'
import  { Menu } from 'react-data-grid-addons' 
import PropTypes from 'prop-types'

import './IgrootSuperTableMenu.css'

const { ContextMenu, MenuItem, SubMenu } = Menu
const contextId = `igroot-supertable-menu-${new Date().getTime()}`

export class IgrootSuperTableMenu extends React.Component {
  render() {
    const { idx, rowIdx, options, id, dataSource } = this.props
    const row = dataSource[rowIdx]
    const _id_ = row && row['_id_']
    
    const MenuItems =[] 
    
    options.map((item, index) => {
      if (item['children']) {
        MenuItems.push(
          <SubMenu title={item.title} key={index}>
          {item['children'].map((subItem, i) => (
            <MenuItem  data={{ row, _id_ }}  onClick={subItem.callback} key={i}>{subItem.title}</MenuItem>
          ))
          }
          </SubMenu>
        )
      } else {
        MenuItems.push(<MenuItem data={{ row, _id_ }} onClick={item.callback} key={index}>{item.title}</MenuItem>)
      }
    })
    
    return (
      <ContextMenu id={id}>
      {MenuItems}
      </ContextMenu>
    )
  }
}

