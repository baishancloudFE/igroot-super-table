import React, { Component } from 'react'

export const formatAutoCompleteOptions = (options) => {
  return options.map(item => (
    {
      id: item.value,
      title: item.label
    }
  ))
}

export const formatSelectOptions = (options) => {
  return options.map(item => (
    {
      id: item.value,
      title: item.label,
      text: item.label,
      value: item.label
    }
  ))
}

export const formatterWrapper = (callback, data=[]) => {
  return class formatter extends Component {
    render() {
      const { value, rowIdx } = this.props 

      return (
        <div>
          {callback(value, data.length && data[rowIdx])}
        </div>
      )
    }
  }
}