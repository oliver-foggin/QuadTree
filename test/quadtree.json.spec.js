const { expect } = require('chai');
const { QuadTree, Rectangle, Point, Circle } = require('../quadtree');

describe('QuadTree', () => {
  describe('json operations', () => {
    let quadtree;
    beforeEach(() => {
      quadtree = new QuadTree(new Rectangle(0, 0, 40, 40), 2);
      points = [
        new Point(-10, 10, { index: 0 }),
        new Point(-10, -10, { index: 1 }),
        new Point(10, 10, { index: 2 }),
        new Point(10, -10, { index: 3 }),
        new Point(-15, 15, { index: 4 }),
        new Point(-15, -15, { index: 5 }),
        new Point(15, 15, { index: 6 }),
        new Point(15, -15, { index: 7 })
      ];
      points.forEach(point => quadtree.insert(point));
    });
    it('throws exception when JSON has no position data', () => {
      expect(() => { QuadTree.fromJSON({ points: [] }) }).to.throw(TypeError);
    });
    it('throws exception when JSON has no position data with correct message', () => {
      expect(() => { QuadTree.fromJSON({ points: [] }) }).to.throw('JSON missing boundary information');
    })
    describe('when saving all data to a JSON object', () => {
      beforeEach(() => {
        obj = quadtree.toJSON();
      })
      it('new object inherits boundary x', () => {
        expect(obj.x).to.equal(quadtree.boundary.x);
      })
      it('new object inherits boundary y', () => {
        expect(obj.y).to.equal(quadtree.boundary.y);
      })
      it('new object inherits boundary w', () => {
        expect(obj.w).to.equal(quadtree.boundary.w);
      })
      it('new object inherits boundary h', () => {
        expect(obj.h).to.equal(quadtree.boundary.h);
      })
      it('new object inherits capacity', () => {
        expect(obj.capacity).to.equal(quadtree.capacity);
      })
    });
    it('is a commutative operation', () => {
      let quadtree = QuadTree.create(400, 300, 800, 600, 4);
      for (let i = 0; i < 6; ++i) {
        quadtree.insert(new Point(Math.random() * 800, Math.random() * 600));
      }
      let created = quadtree.toJSON();
      let result = QuadTree.fromJSON(created);
      expect(result).to.deep.equal(quadtree);
    })
    it('loads properly from a JSON object', () => {
      const obj = quadtree.toJSON();
      const test = QuadTree.fromJSON(obj);
      expect(test.boundary.x).to.equal(quadtree.boundary.x);
      expect(test.boundary.y).to.equal(quadtree.boundary.y);
      expect(test.boundary.w).to.equal(quadtree.boundary.w);
      expect(test.boundary.h).to.equal(quadtree.boundary.h);
      expect(test.capacity).to.equal(quadtree.capacity);
      expect(test.northeast.boundary.x).to.equal(quadtree.northeast.boundary.x);
      expect(test.northeast.points[0].userData.index).to.equal(quadtree.northeast.points[0].userData.index);
      expect(test.northwest.divided).to.be.equal(quadtree.northwest.divided);
      expect(test.southeast.x).to.be.equal(quadtree.southeast.x);
      expect(test.southwest.y).to.be.equal(quadtree.southwest.y);
    });
  });
});
