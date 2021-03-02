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
import Text from '../../../chem/struct/text'
import Restruct, { ReText } from '../../../render/restruct'
import Pile from '../../../util/pile'
import Vec2 from '../../../util/vec2'
import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

type Data = {
  textId: any
  text: any
  pos: any
}

class TextAdd extends BaseOperation {
  data: Data

  constructor(text?: any, pos?: any) {
    debugger
    super(OperationType.TEXT_ADD)
    this.data = { text, pos, textId: null }
  }

  execute(restruct: Restruct) {
    const { text, pos } = this.data

    const struct = restruct.molecule

    const pp: { label?: string } = {}
    if (text) {
      Object.keys(text).forEach(p => {
        pp[p] = text[p]
      })
    }

    pp.label = pp.label || 'text label'

    if (typeof this.data.textId !== 'number') {
      this.data.textId = struct.texts.add(new Text(pp))
    } else {
      struct.texts.set(this.data.textId, new Text(pp))
    }

    const { textId } = this.data

    // notifyAtomAdded
    const textData = new ReText(struct.texts.get(textId))

    textData.component = restruct.connectedComponents.add(new Pile([textId]))
    restruct.texts.set(textId, textData)
    restruct.markText(textId, 1)

    struct.textSetPos(textId, new Vec2(pos))
  }
}

// class AtomDelete extends BaseOperation {
//   data: Data

//   constructor(atomId?: any) {
//     super(OperationType.ATOM_DELETE)
//     this.data = { aid: atomId, atom: null, pos: null }
//   }

//   execute(restruct: Restruct) {
//     const { aid } = this.data

//     const struct = restruct.molecule
//     if (!this.data.atom) {
//       this.data.atom = struct.atoms.get(aid)
//       this.data.pos = this.data.atom.pp
//     }

//     // notifyAtomRemoved(aid);
//     const restructedAtom = restruct.atoms.get(aid)
//     if (!restructedAtom) {
//       return
//     }

//     const set = restruct.connectedComponents.get(restructedAtom.component)
//     set.delete(aid)
//     if (set.size === 0) {
//       restruct.connectedComponents.delete(restructedAtom.component)
//     }

//     restruct.clearVisel(restructedAtom.visel)
//     restruct.atoms.delete(aid)
//     restruct.markItemRemoved()
//     struct.atoms.delete(aid)
//   }

//   invert() {
//     const inverted = new AtomAdd()
//     inverted.data = this.data
//     return inverted
//   }
// }

export { TextAdd }
// export * from './AtomAttr'
// export * from './AtomMove'
