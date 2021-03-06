/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import ReObject from './reobject'
import draw from '../draw'
import util from '../util'
import { SimpleObjectMode, Box2Abs, Vec2, scale } from 'ketcher-core'

const tfx = util.tfx

function ReSimpleObject(simpleObject) {
  this.init('simpleObject')

  this.item = simpleObject
}
ReSimpleObject.prototype = new ReObject()
ReSimpleObject.isSelectable = function () {
  return true
}
ReSimpleObject.prototype.calcDistance = function (p, s) {
  const point = new Vec2(p.x, p.y)
  let dist = null
  let distRef = null
  const item = this.item
  const mode = item.mode
  const pos = item.pos

  switch (mode) {
    case SimpleObjectMode.ellipse: {
      const rad = Vec2.diff(pos[1], pos[0])
      const rx = rad.x / 2
      const ry = rad.y / 2
      const center = Vec2.sum(pos[0], { x: rx, y: ry })
      const pointToCenter = Vec2.diff(point, center)
      if (rx !== 0 && ry !== 0) {
        dist = Math.abs(
          1 -
            (pointToCenter.x * pointToCenter.x) / (rx * rx) -
            (pointToCenter.y * pointToCenter.y) / (ry * ry)
        )
      } else {
        // in case rx or ry is equal to 0 we have a line as a trivial case of ellipse
        // in such case distance need to be calculated as a distance between line and current point
        dist = calculateDistanceToLine(pos, point)
      }
      break
    }
    case SimpleObjectMode.rectangle: {
      const topX = Math.min(pos[0].x, pos[1].x)
      const topY = Math.min(pos[0].y, pos[1].y)
      const bottomX = Math.max(pos[0].x, pos[1].x)
      const bottomY = Math.max(pos[0].y, pos[1].y)

      const distances = []

      if (point.x >= topX && point.x <= bottomX) {
        if (point.y < topY) {
          distances.push(topY - point.y)
        } else if (point.y > bottomY) {
          distances.push(point.y - bottomY)
        } else {
          distances.push(point.y - topY, bottomY - point.y)
        }
      }
      if (point.x < topX && point.y < topY) {
        distances.push(Vec2.dist(new Vec2(topX, topY), point))
      }
      if (point.x > bottomX && point.y > bottomY) {
        distances.push(Vec2.dist(new Vec2(bottomX, bottomY), point))
      }
      if (point.x < topX && point.y > bottomY) {
        distances.push(Vec2.dist(new Vec2(topX, bottomY), point))
      }
      if (point.x > bottomX && point.y < topY) {
        distances.push(Vec2.dist(new Vec2(bottomX, topY), point))
      }
      if (point.y >= topY && point.y <= bottomY) {
        if (point.x < topX) {
          distances.push(topX - point.x)
        } else if (point.x > bottomX) {
          distances.push(point.x - bottomX)
        } else {
          distances.push(point.x - topX, bottomX - point.x)
        }
      }
      dist = Math.min(...distances)
      break
    }
    case SimpleObjectMode.line: {
      dist = calculateDistanceToLine(pos, point)
      break
    }

    default: {
      throw new Error('Unsupported shape type')
    }
  }

  distRef = this.getReferencePointDistance(p)
  const refPoint = distRef.minDist <= 8 / s ? distRef.refPoint : null
  // distance is a smallest between dist to figure and it's reference points
  dist = Math.min(distRef.minDist, dist)
  return { minDist: dist, refPoint: refPoint }
}

function calculateDistanceToLine(pos, point) {
  let dist
  if (
    (point.x < Math.min(pos[0].x, pos[1].x) ||
      point.x > Math.max(pos[0].x, pos[1].x)) &&
    (point.y < Math.min(pos[0].y, pos[1].y) ||
      point.y > Math.max(pos[0].y, pos[1].y))
  )
    dist = Math.min(Vec2.dist(pos[0], point), Vec2.dist(pos[1], point))
  else {
    const a = Vec2.dist(pos[0], pos[1])
    const b = Vec2.dist(pos[0], point)
    const c = Vec2.dist(pos[1], point)
    const per = (a + b + c) / 2
    dist = (2 / a) * Math.sqrt(per * (per - a) * (per - b) * (per - c))
  }
  return dist
}

ReSimpleObject.prototype.getReferencePointDistance = function (p) {
  let dist = []
  const refPoints = this.getReferencePoints()
  refPoints.forEach(rp => {
    dist.push({ minDist: Math.abs(Vec2.dist(p, rp)), refPoint: rp })
  })

  const minDist = dist.reduce(
    (acc, current) =>
      !acc ? current : acc.minDist < current.minDist ? acc : current,
    null
  )

  return minDist
}

ReSimpleObject.prototype.getReferencePoints = function () {
  const refPoints = []
  switch (this.item.mode) {
    case SimpleObjectMode.ellipse:
    case SimpleObjectMode.rectangle: {
      const p0 = new Vec2(
        tfx(Math.min(this.item.pos[0].x, this.item.pos[1].x)),
        tfx(Math.min(this.item.pos[0].y, this.item.pos[1].y))
      )
      const w = Math.abs(Vec2.diff(this.item.pos[0], this.item.pos[1]).x)
      const h = Math.abs(Vec2.diff(this.item.pos[0], this.item.pos[1]).y)

      refPoints.push(
        p0,
        new Vec2(p0.x + 0.5 * w, p0.y),
        new Vec2(p0.x + w, p0.y),
        new Vec2(p0.x + w, p0.y + 0.5 * h),
        new Vec2(p0.x + w, p0.y + h),
        new Vec2(p0.x + 0.5 * w, p0.y + h),
        new Vec2(p0.x, p0.y + h),
        new Vec2(p0.x, p0.y + 0.5 * h)
      )
      break
    }
    case SimpleObjectMode.line: {
      this.item.pos.forEach(i => refPoints.push(i))
      break
    }

    default: {
      throw new Error('Unsupported shape type')
    }
  }
  return refPoints
}

ReSimpleObject.prototype.highlightPath = function (render) {
  const point = []

  this.item.pos.forEach((p, index) => {
    point[index] = scale.obj2scaled(p, render.options)
  })
  const scaleFactor = render.options.scale

  const path = []

  //TODO: It seems that inheritance will be the better approach here
  switch (this.item.mode) {
    case SimpleObjectMode.ellipse: {
      const rad = Vec2.diff(point[1], point[0])
      const rx = rad.x / 2
      const ry = rad.y / 2
      path.push(
        render.paper.ellipse(
          tfx(point[0].x + rx),
          tfx(point[0].y + ry),
          tfx(Math.abs(rx) + scaleFactor / 8),
          tfx(Math.abs(ry) + scaleFactor / 8)
        )
      )
      if (
        Math.abs(rx) - scaleFactor / 8 > 0 &&
        Math.abs(ry) - scaleFactor / 8 > 0
      )
        path.push(
          render.paper.ellipse(
            tfx(point[0].x + rx),
            tfx(point[0].y + ry),
            tfx(Math.abs(rx) - scaleFactor / 8),
            tfx(Math.abs(ry) - scaleFactor / 8)
          )
        )
      break
    }

    case SimpleObjectMode.rectangle: {
      path.push(
        render.paper.rect(
          tfx(Math.min(point[0].x, point[1].x) - scaleFactor / 8),
          tfx(Math.min(point[0].y, point[1].y) - scaleFactor / 8),
          tfx(
            Math.max(point[0].x, point[1].x) -
              Math.min(point[0].x, point[1].x) +
              scaleFactor / 4
          ),
          tfx(
            Math.max(point[0].y, point[1].y) -
              Math.min(point[0].y, point[1].y) +
              scaleFactor / 4
          )
        )
      )

      path.push(
        render.paper.rect(
          tfx(Math.min(point[0].x, point[1].x) + scaleFactor / 8),
          tfx(Math.min(point[0].y, point[1].y) + scaleFactor / 8),
          tfx(
            Math.max(point[0].x, point[1].x) -
              Math.min(point[0].x, point[1].x) -
              scaleFactor / 4
          ),
          tfx(
            Math.max(point[0].y, point[1].y) -
              Math.min(point[0].y, point[1].y) -
              scaleFactor / 4
          )
        )
      )

      break
    }
    case SimpleObjectMode.line: {
      //TODO: reuse this code for polyline
      const poly = []

      let angle = Math.atan(
        (point[1].y - point[0].y) / (point[1].x - point[0].x)
      )

      const p0 = { x: 0, y: 0 }
      const p1 = { x: 0, y: 0 }

      const k = point[0].x > point[1].x ? -1 : 1

      p0.x = point[0].x - k * ((scaleFactor / 8) * Math.cos(angle))
      p0.y = point[0].y - k * ((scaleFactor / 8) * Math.sin(angle))
      p1.x = point[1].x + k * ((scaleFactor / 8) * Math.cos(angle))
      p1.y = point[1].y + k * ((scaleFactor / 8) * Math.sin(angle))

      poly.push(
        'M',
        p0.x + ((k * scaleFactor) / 8) * Math.sin(angle),
        p0.y - ((k * scaleFactor) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p1.x + ((k * scaleFactor) / 8) * Math.sin(angle),
        p1.y - ((k * scaleFactor) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p1.x - ((k * scaleFactor) / 8) * Math.sin(angle),
        p1.y + ((k * scaleFactor) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p0.x - ((k * scaleFactor) / 8) * Math.sin(angle),
        p0.y + ((k * scaleFactor) / 8) * Math.cos(angle)
      )
      poly.push(
        'L',
        p0.x + ((k * scaleFactor) / 8) * Math.sin(angle),
        p0.y - ((k * scaleFactor) / 8) * Math.cos(angle)
      )

      path.push(render.paper.path(poly))
      break
    }
    default: {
      throw new Error('Unsupported shape type')
    }
  }

  const enhPaths = path.map(p => {
    return { path: p, stylesApplied: false }
  })

  return enhPaths
}

ReSimpleObject.prototype.drawHighlight = function (render) {
  const paths = this.highlightPath(render).map(enhPath => {
    if (!enhPath.stylesApplied) {
      return enhPath.path.attr(render.options.highlightStyle)
    }
    return enhPath.path
  })

  render.ctab.addReObjectPath('highlighting', this.visel, paths)
  return paths
}

ReSimpleObject.prototype.makeSelectionPlate = function (
  restruct,
  paper,
  styles
) {
  const pos = this.item.pos.map(p => {
    return scale.obj2scaled(p, restruct.render.options) || new Vec2()
  })

  const refPoints = this.getReferencePoints()
  const scaleFactor = restruct.render.options.scale
  var selectionSet = restruct.render.paper.set()
  selectionSet.push(
    generatePath(this.item.mode, paper, pos).attr(
      styles.highlightStyleSimpleObject
    )
  )
  refPoints.forEach(rp => {
    const scaledRP = scale.obj2scaled(rp, restruct.render.options)
    selectionSet.push(
      restruct.render.paper
        .circle(scaledRP.x, scaledRP.y, scaleFactor / 8)
        .attr({ fill: 'black' })
    )
  })
  return selectionSet
}

ReSimpleObject.prototype.show = function (restruct, id, options) {
  const render = restruct.render
  const pos = this.item.pos.map((p, index) => {
    return scale.obj2scaled(p, options) || new Vec2()
  })

  const path = generatePath(this.item.mode, render.paper, pos, options)

  var offset = options.offset
  if (offset != null) path.translateAbs(offset.x, offset.y)
  this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())))
}

function generatePath(mode, paper, pos, options) {
  let path = null
  switch (mode) {
    case SimpleObjectMode.ellipse: {
      path = draw.ellipse(paper, pos, options)
      break
    }
    case SimpleObjectMode.rectangle: {
      path = draw.rectangle(paper, pos, options)
      break
    }
    case SimpleObjectMode.line: {
      path = draw.line(paper, pos, options)
      break
    }
    default: {
      throw new Error('Unsupported shape type')
    }
  }

  return path
}

export default ReSimpleObject
