
import React, { Component } from 'react'
import  { Menu } from 'react-data-grid-addons' 
import PropTypes from 'prop-types'

import './IgrootSuperTableMenu.css'

const { ContextMenu, MenuItem, SubMenu } = Menu
const contextId = `igroot-supertable-menu-${new Date().getTime()}`

export class IgrootSuperTableMenu extends React.Component {
  render() {
    const { idx, rowIdx, options, id } = this.props
    const MenuItems =[] 
    
    options.map((item, index) => {
      if (item['children']) {
        MenuItems.push(
          <SubMenu title={item.title} key={index}>
          {item['children'].map((subItem, i) => (
            <MenuItem data={{ rowIdx, idx }} onClick={subItem.callback} key={i}>{subItem.title}</MenuItem>
          ))
          }
          </SubMenu>
        )
      } else {
        MenuItems.push(<MenuItem data={{ rowIdx, idx }} onClick={item.callback} key={index}>{item.title}</MenuItem>)
      }
    })
    
    return (
      <ContextMenu id={id}>
      {MenuItems}
      </ContextMenu>
    )
  }
}

