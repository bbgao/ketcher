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

import Vec2 from '../../util/vec2'

function Text(params) {
  const getDefaultAttr = Text.getDefaultAttribute

  ifDefined(this, params, 'alias', getDefaultAttr('alias'))
  this.pp = params.pp ? new Vec2(params.pp) : new Vec2() //pp = pagePosition or paperPosition?
}

Text.getAttrHash = function (text) {
  //rename method
  let attributes = {}

  for (let attribute in Text.attributesList) {
    if (typeof text[attribute] !== 'undefined') {
      attributes[attribute] = text[attribute]
    }
  }

  return attributes
}

Text.getDefaultAttribute = attribute => {
  if (attribute in Text.attributesList) {
    return Text.attributesList[attribute]
  } else {
    console.assert(false, 'Attribute unknown')
  }
}

Text.attributesList = {
  alias: null //Do we need it?
}

function ifDefined(dst, src, prop, def) {
  dst[prop] = !(typeof src[prop] === 'undefined') ? src[prop] : def
}

export default Text
