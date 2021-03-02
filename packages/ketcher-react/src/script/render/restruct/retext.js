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

import Box2Abs from '../../util/box2abs'
import ReObject from './reobject'
import scale from '../../util/scale'
import { sketchingColors as elementColor } from '../../chem/element-color'
import draw from '../draw'
import util from '../util'

/** @param {import('../../chem/struct/text').default} text */
function ReText(text) {
  this.visel = undefined // for typing
  this.init('text')

  /** @type {import('../../chem/struct/text').default} */
  this.text = text
  this.showLabel = false
  this.color = '#000000'
  this.component = -1
}

ReText.prototype = Object.create(ReObject)
ReText.prototype.constructor = ReText
ReText.isSelectable = function () {
  return true //Do we need selectable? R-group Label is not selectable
}

ReText.prototype.getVBoxObj = function (render) {
  if (this.visel.boundingBox)
    return ReObject.prototype.getVBoxObj.call(this, render)
  return new Box2Abs(this.text.pp, this.text.pp)
}

ReText.prototype.show = function (restruct, textId, options) {
  // eslint-disable-line max-statements
  const render = restruct.render
  const position = scale.obj2scaled(this.a.pp, render.options)
  const label = buildLabel(this, render.paper, position, options)

  this.color = 'black' // reset colour
  restruct.addReObjectPath('data', this.visel, label.path, position, true)
}

function buildLabel(text, paper, position, options) {
  // eslint-disable-line max-statements
  let label = {}
  label.text = text.label

  if (label.text === '') label = 'dummy text' // temporary solution for testing, TODO: disable 'OK' button in dialog if no text is typed
  text.color = elementColor[label.text] || '#000'

  label.path = paper.text(position.x, position.y, label.text).attr({
    font: options.font,
    'font-size': options.fontsz,
    fill: text.color,
    'font-style': 'italic' // temporary, TODO: add text styling in #339
  })

  label.rbb = util.relBox(label.path.getBBox())
  draw.recenterText(label.path, label.rbb)

  text.label = label
  return label
}

export default ReText
