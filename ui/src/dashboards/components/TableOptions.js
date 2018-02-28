import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import _ from 'lodash'
import uuid from 'node-uuid'

import FancyScrollbar from 'shared/components/FancyScrollbar'
import Dropdown from 'shared/components/Dropdown'
import GraphOptionsThresholds from 'src/dashboards/components/GraphOptionsThresholds'
import GraphOptionsThresholdColoring from 'src/dashboards/components/GraphOptionsThresholdColoring'
import GraphOptionsTextWrapping from 'src/dashboards/components/GraphOptionsTextWrapping'
import GraphOptionsCustomizeColumns from 'src/dashboards/components/GraphOptionsCustomizeColumns'

import {
  GAUGE_COLORS,
  DEFAULT_VALUE_MIN,
  DEFAULT_VALUE_MAX,
  MAX_THRESHOLDS,
  SINGLE_STAT_TEXT,
  SINGLE_STAT_BG,
} from 'src/dashboards/constants/gaugeColors'

import {
  updateSingleStatType,
  updateSingleStatColors,
  updateAxes,
} from 'src/dashboards/actions/cellEditorOverlay'

const formatColor = color => {
  const {hex, name} = color
  return {hex, name}
}

class TableOptions extends Component {
  handleToggleSingleStatType = newType => () => {
    const {handleUpdateSingleStatType} = this.props

    handleUpdateSingleStatType(newType)
  }

  handleAddThreshold = () => {
    const {
      singleStatColors,
      singleStatType,
      handleUpdateSingleStatColors,
    } = this.props

    const randomColor = _.random(0, GAUGE_COLORS.length - 1)

    const maxValue = DEFAULT_VALUE_MIN
    const minValue = DEFAULT_VALUE_MAX

    let randomValue = _.round(_.random(minValue, maxValue, true), 2)

    if (singleStatColors.length > 0) {
      const colorsValues = _.mapValues(singleStatColors, 'value')
      do {
        randomValue = _.round(_.random(minValue, maxValue, true), 2)
      } while (_.includes(colorsValues, randomValue))
    }

    const newThreshold = {
      type: singleStatType,
      id: uuid.v4(),
      value: randomValue,
      hex: GAUGE_COLORS[randomColor].hex,
      name: GAUGE_COLORS[randomColor].name,
    }

    handleUpdateSingleStatColors([...singleStatColors, newThreshold])
  }

  handleDeleteThreshold = threshold => () => {
    const {handleUpdateSingleStatColors} = this.props

    const singleStatColors = this.props.singleStatColors.filter(
      color => color.id !== threshold.id
    )

    handleUpdateSingleStatColors(singleStatColors)
  }

  handleChooseColor = threshold => chosenColor => {
    const {handleUpdateSingleStatColors} = this.props

    const singleStatColors = this.props.singleStatColors.map(
      color =>
        color.id === threshold.id
          ? {...color, hex: chosenColor.hex, name: chosenColor.name}
          : color
    )

    handleUpdateSingleStatColors(singleStatColors)
  }

  handleChooseSortBy = value => {}

  handleTimeFormatChange = format => {}

  handleToggleTimeAxis = axis => {}

  handleToggleTextWrapping = wrapType => {}

  handleColumnRename = newName => {}

  handleUpdateColorValue = (threshold, value) => {
    const {handleUpdateSingleStatColors} = this.props

    const singleStatColors = this.props.singleStatColors.map(
      color => (color.id === threshold.id ? {...color, value} : color)
    )

    handleUpdateSingleStatColors(singleStatColors)
  }

  handleValidateColorValue = (threshold, targetValue) => {
    const {singleStatColors} = this.props
    const sortedColors = _.sortBy(singleStatColors, color => color.value)

    return !sortedColors.some(color => color.value === targetValue)
  }

  handleUpdatePrefix = e => {
    const {handleUpdateAxes, axes} = this.props
    const newAxes = {...axes, y: {...axes.y, prefix: e.target.value}}

    handleUpdateAxes(newAxes)
  }

  handleUpdateSuffix = e => {
    const {handleUpdateAxes, axes} = this.props
    const newAxes = {...axes, y: {...axes.y, suffix: e.target.value}}

    handleUpdateAxes(newAxes)
  }

  render() {
    const {
      singleStatColors,
      singleStatType,
      //   axes: {y: {prefix, suffix}},
    } = this.props

    const disableAddThreshold = singleStatColors.length > MAX_THRESHOLDS

    const sortedColors = _.sortBy(singleStatColors, color => color.value)

    const columns = ['hey', 'yo', 'what'].map(col => ({
      text: col,
      name: col,
      newName: '',
    }))

    return (
      <FancyScrollbar
        className="display-options--cell y-axis-controls"
        autoHide={false}
      >
        <div className="display-options--cell-wrapper">
          <h5 className="display-options--header">Table Controls</h5>
          <div className="gauge-controls">
            <label>Time Format</label>
            <input
              className="form-control input-sm"
              placeholder="mm/dd/yyyy HH:mm:ss.ss"
              defaultValue="mm/dd/yyyy HH:mm:ss.ss"
              onChange={this.handleTimeFormatChange}
            />
            <div className="form-group col-xs-6">
              <label>Time Axis</label>
              <ul className="nav nav-tablist nav-tablist-sm">
                <li
                  className={`${singleStatType === SINGLE_STAT_BG
                    ? 'active'
                    : ''}`}
                  onClick={this.handleToggleTimeAxis}
                >
                  Vertical
                </li>
                <li
                  className={`${singleStatType === SINGLE_STAT_TEXT
                    ? 'active'
                    : ''}`}
                  onClick={this.handleToggleTimeAxis}
                >
                  Horizontal
                </li>
              </ul>
            </div>
            <div className="form-group col-xs-6">
              <label>Sort By</label>
              <Dropdown
                items={columns}
                selected="hey"
                buttonColor="btn-primary"
                buttonSize="btn-xs"
                className="dropdown-stretch"
                onChoose={this.handleChooseSortBy}
              />
            </div>
            <GraphOptionsTextWrapping
              singleStatType={singleStatType}
              handleToggleTextWrapping={this.handleToggleTextWrapping}
            />
            <GraphOptionsCustomizeColumns
              columns={columns}
              handleColumnRename={this.handleColumnRename}
            />
            <GraphOptionsThresholds
              handleAddThreshold={this.handleAddThreshold}
              disableAddThreshold={disableAddThreshold}
              sortedColors={sortedColors}
              formatColor={formatColor}
              handleChooseColor={this.handleChooseColor}
              handleValidateColorValue={this.handleValidateColorValue}
              handleUpdateColorValue={this.handleUpdateColorValue}
              handleDeleteThreshold={this.handleDeleteThreshold}
            />
            <GraphOptionsThresholdColoring
              handleToggleSingleStatType={this.handleToggleSingleStatType}
              singleStatColors={singleStatType}
            />
          </div>
        </div>
      </FancyScrollbar>
    )
  }
}

const {arrayOf, func, number, shape, string} = PropTypes

TableOptions.defaultProps = {
  colors: [],
}

TableOptions.propTypes = {
  singleStatType: string.isRequired,
  singleStatColors: arrayOf(
    shape({
      type: string.isRequired,
      hex: string.isRequired,
      id: string.isRequired,
      name: string.isRequired,
      value: number.isRequired,
    }).isRequired
  ),
  handleUpdateSingleStatType: func.isRequired,
  handleUpdateSingleStatColors: func.isRequired,
  handleUpdateAxes: func.isRequired,
  axes: shape({}).isRequired,
}

const mapStateToProps = ({
  cellEditorOverlay: {singleStatType, singleStatColors, cell: {axes}},
}) => ({
  singleStatType,
  singleStatColors,
  axes,
})

const mapDispatchToProps = dispatch => ({
  handleUpdateSingleStatType: bindActionCreators(
    updateSingleStatType,
    dispatch
  ),
  handleUpdateSingleStatColors: bindActionCreators(
    updateSingleStatColors,
    dispatch
  ),
  handleUpdateAxes: bindActionCreators(updateAxes, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(TableOptions)
