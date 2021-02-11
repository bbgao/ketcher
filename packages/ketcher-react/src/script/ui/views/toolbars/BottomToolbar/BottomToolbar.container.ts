/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { ComponentType } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { onAction } from '../../../state'
import {
  BottomToolbar,
  BottomToolbarProps,
  BottomToolbarCallProps
} from './BottomToolbar'

const mapStateToProps = (state): BottomToolbarProps => ({
  active: state.actionState && state.actionState.activeTool,
  status: state.actionState || {},
  freqAtoms: state.toolbar.freqAtoms,
  opened: state.toolbar.opened,
  visibleTools: state.toolbar.visibleTools,
  indigoVerification: state.requestsStatuses.indigoVerification,
  disableableButtons: []
})

const mapDispatchToProps = (dispatch: Dispatch): BottomToolbarCallProps => ({
  onAction,
  onOpen: (menuName, isSelected) =>
    dispatch({
      type: 'OPENED',
      data: { menuName, isSelected }
    })
})

const BottomToolbarContainer: ComponentType = connect(
  mapStateToProps,
  mapDispatchToProps
)(BottomToolbar)

export { BottomToolbarContainer }
export default BottomToolbarContainer
