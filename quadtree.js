// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// QuadTree

class Point {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.userData = data;
  }

  // Pythagorus: a^2 = b^2 + c^2
  distanceFrom(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.left = x - w / 2;
    this.right = x + w / 2;
    this.top = y - h / 2;
    this.bottom = y + h / 2;
  }

  contains(point) {
    return (
      this.left <= point.x && point.x <= this.right &&
      this.top <= point.y && point.y <= this.bottom
    );
  }

  intersects(range) {
    return !(
      this.right < range.left || range.right < this.left ||
      this.bottom < range.top || range.bottom < this.top
    );
  }

  subdivide(quadrant) {
    switch (quadrant) {
      case 'ne':
        return new Rectangle(this.x + this.w / 4, this.y - this.h / 4, this.w / 2, this.h / 2);
      case 'nw':
        return new Rectangle(this.x - this.w / 4, this.y - this.h / 4, this.w / 2, this.h / 2);
      case 'se':
        return new Rectangle(this.x + this.w / 4, this.y + this.h / 4, this.w / 2, this.h / 2);
      case 'sw':
        return new Rectangle(this.x - this.w / 4, this.y + this.h / 4, this.w / 2, this.h / 2);
    }
  }

  xDistanceFrom(point) {
    if (this.left <= point.x && point.x <= this.right) {
      return 0;
    }

    return Math.min(
      Math.abs(point.x - this.left),
      Math.abs(point.x - this.right)
    );
  }

  yDistanceFrom(point) {
    if (this.top <= point.y && point.y <= this.bottom) {
      return 0;
    }

    return Math.min(
      Math.abs(point.y - this.top),
      Math.abs(point.y - this.bottom)
    );
  }

  distanceFrom(point) {
    const dx = this.xDistanceFrom(point);
    const dy = this.yDistanceFrom(point);

    return Math.sqrt(dx * dx + dy * dy);
  }
}

// circle class for a circle shaped query
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = this.r * this.r;
  }

  contains(point) {
    // check if the point is in the circle by checking if the euclidean distance of
    // the point and the center of the circle if smaller or equal to the radius of
    // the circle
    let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
    return d <= this.rSquared;
  }

  intersects(range) {

    let xDist = Math.abs(range.x - this.x);
    let yDist = Math.abs(range.y - this.y);

    // radius of the circle
    let r = this.r;

    let w = range.w / 2;
    let h = range.h / 2;

    let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

    // no intersection
    if (xDist > (r + w) || yDist > (r + h))
      return false;

    // intersection within the circle
    if (xDist <= w || yDist <= h)
      return true;

    // intersection on the edge of the circle
    return edges <= this.rSquared;
  }
}

class QuadTree {
  constructor(boundary, capacity, depth = 10) {
    if (!boundary) {
      throw TypeError('boundary is null or undefined');
    }
    if (!(boundary instanceof Rectangle)) {
      throw TypeError('boundary should be a Rectangle');
    }
    if (typeof capacity !== 'number') {
      throw TypeError(`capacity should be a number but is a ${typeof capacity}`);
    }
    if (capacity < 1) {
      throw RangeError('capacity must be greater than 0');
    }
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.depth = depth;
  }

  get children() {
    if (this.divided) {
      return [
        this.northeast,
        this.northwest,
        this.southeast,
        this.southwest
      ];
    } else {
      return [];
    }
  }

  static create() {
    let DEFAULT_CAPACITY = 8;
    if (arguments.length === 0) {
      if (typeof width === "undefined") {
        throw new TypeError("No global width defined");
      }
      if (typeof height === "undefined") {
        throw new TypeError("No global height defined");
      }
      let bounds = new Rectangle(width / 2, height / 2, width, height);
      return new QuadTree(bounds, DEFAULT_CAPACITY);
    }
    if (arguments[0] instanceof Rectangle) {
      let capacity = arguments[1] || DEFAULT_CAPACITY;
      return new QuadTree(arguments[0], capacity);
    }
    if (typeof arguments[0] === "number" &&
        typeof arguments[1] === "number" &&
        typeof arguments[2] === "number" &&
        typeof arguments[3] === "number") {
      let capacity = arguments[4] || DEFAULT_CAPACITY;
      return new QuadTree(new Rectangle(arguments[0], arguments[1], arguments[2], arguments[3]), capacity);
    }
    throw new TypeError('Invalid parameters');
  }

  toJSON() {
    let allPoints = [];
    this.forEach(p => allPoints.push(p));

    let obj = {}

    obj.points = allPoints;
    obj.x = this.boundary.x;
    obj.y = this.boundary.y;
    obj.w = this.boundary.w;
    obj.h = this.boundary.h;
    obj.depth = this.depth;
    obj.capacity = this.capacity;

    return obj;
  }

  static fromJSON(obj) {
    if (
      obj.x == undefined ||
      obj.y == undefined ||
      obj.w == undefined ||
      obj.h == undefined
      ) {
        throw TypeError("JSON missing boundary information");
      };

    let qt = new QuadTree(new Rectangle(obj.x, obj.y, obj.w,obj.h), obj.capacity, obj.depth);

    obj.points.forEach(p => qt.insert(p));

    return qt;
  }

  subdivide() {
    this.northwest = new QuadTree(this.boundary.subdivide('nw'), this.capacity, this.depth - 1);
    this.southeast = new QuadTree(this.boundary.subdivide('se'), this.capacity, this.depth - 1);
    this.northeast = new QuadTree(this.boundary.subdivide('ne'), this.capacity, this.depth - 1);
    this.southwest = new QuadTree(this.boundary.subdivide('sw'), this.capacity, this.depth - 1);

    this.divided = true;
  }

  insert(point) {
    if (this.divided) {
      return this.children.reduce((p, c) => p || c.insert(point), false);
    }

    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.depth == 0 || this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    this.subdivide();
    let p;
    while (p = this.points.shift()) this.insert(p);
    return this.insert(point);
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!range.intersects(this.boundary)) {
      return found;
    }

    for (let p of this.points) {
      if (range.contains(p)) {
        found.push(p);
      }
    }
    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }

  closest(searchPoint, maxCount = 1, maxDistance = Infinity) {
    if (typeof searchPoint === "undefined") {
      throw TypeError("Method 'closest' needs a point");
    }

    return this.kNearest(searchPoint, maxCount, maxDistance, 0, 0).found;
  }

  kNearest(searchPoint, maxCount, maxDistance, furthestDistance, foundSoFar) {
    let found = [];

    this.children.sort((a, b) => a.boundary.distanceFrom(searchPoint) - b.boundary.distanceFrom(searchPoint))
      .forEach((child) => {
        const distance = child.boundary.distanceFrom(searchPoint);
        if (distance > maxDistance) {
          return;
        } else if (foundSoFar < maxCount || distance < furthestDistance) {
          const result = child.kNearest(searchPoint, maxCount, maxDistance, furthestDistance, foundSoFar);
          const childPoints = result.found;
          found = found.concat(childPoints);
          foundSoFar += childPoints.length;
          furthestDistance = result.furthestDistance;
        }
      });

    this.points
      .forEach((p) => {
        const distance = p.distanceFrom(searchPoint);
        if (distance > maxDistance) {
          return;
        } else if (foundSoFar < maxCount || distance < furthestDistance) {
          found.push(p);
          furthestDistance = Math.max(distance, furthestDistance);
          foundSoFar++;
        }
      });

    return {
      found: found.sort((a, b) => a.distanceFrom(searchPoint) - b.distanceFrom(searchPoint)).slice(0, maxCount),
      furthestDistance
    };
  }

  forEach(fn) {
    this.points.forEach(fn);
    if (this.divided) {
      this.northeast.forEach(fn);
      this.northwest.forEach(fn);
      this.southeast.forEach(fn);
      this.southwest.forEach(fn);
    }
  }

  merge(other, capacity) {
    let left = Math.min(this.boundary.left, other.boundary.left);
    let right = Math.max(this.boundary.right, other.boundary.right);
    let top = Math.min(this.boundary.top, other.boundary.top);
    let bottom = Math.max(this.boundary.bottom, other.boundary.bottom);
    let height = bottom - top;
    let width = right - left;
    let midX = left + width / 2;
    let midY = top + height / 2;
    let boundary = new Rectangle(midX, midY, width, height);
    let result = new QuadTree(boundary, capacity);
    this.forEach(point => result.insert(point));
    other.forEach(point => result.insert(point));

    return result;
  }

  get length() {
    let count = this.points.length;
    if (this.divided) {
      count += this.northwest.length;
      count += this.northeast.length;
      count += this.southwest.length;
      count += this.southeast.length;
    }
    return count;
  }
}

if (typeof module !== "undefined") {
  module.exports = { Point, Rectangle, QuadTree, Circle };
}
