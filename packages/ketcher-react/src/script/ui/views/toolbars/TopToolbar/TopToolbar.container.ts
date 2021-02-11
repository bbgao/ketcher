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
import { TopToolbar, TopToolbarProps, TopToolbarCallProps } from './TopToolbar'

const mapStateToProps = (state): TopToolbarProps => ({
  active: state.actionState && state.actionState.activeTool,
  status: state.actionState || {},
  freqAtoms: state.toolbar.freqAtoms,
  opened: state.toolbar.opened,
  visibleTools: state.toolbar.visibleTools,
  indigoVerification: state.requestsStatuses.indigoVerification,
  disableableButtons: ['layout', 'clean', 'arom', 'dearom', 'cip']
})

const mapDispatchToProps = (dispatch: Dispatch): TopToolbarCallProps => ({
  onAction,
  onOpen: (menuName, isSelected) =>
    dispatch({
      type: 'OPENED',
      data: { menuName, isSelected }
    })
})

const TopToolbarContainer: ComponentType = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopToolbar)

export { TopToolbarContainer }
export default TopToolbarContainer
