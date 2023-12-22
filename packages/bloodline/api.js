import { pipe, curry, unless, when, identity as I } from 'ramda'
import { mapRej, Future } from 'fluture'
import { treeWithCancel } from './tree'
import { checkCyclicWithCancel } from './cyclic'
import { handleWarnings } from './failure'
import { isString, neue, wrap } from 'inherent'

export const makeArteryWithCancel = curry((cancel, filepath, config) =>
  Future((bad, good) => {
    const $conf = neue(defaultConfig, config)
    // TODO: make it so that we can consume other bloodlines
    const path = when(isString, wrap)(filepath)
    pipe(
      treeWithCancel(cancel, path),
      mapRej(handleWarnings),
      $conf.checkCyclic ? checkCyclicWithCancel(cancel) : I,
      good
    )($conf)
    return cancel
  })
)

const defaultConfig = {
  baseDir: null,
  excludeRegExp: false,
  fileExtensions: ['js'],
  includeNpm: false,
  requireConfig: null,
  webpackConfig: null,
  tsConfig: null,
  rankdir: 'LR',
  layout: 'dot',
  fontName: 'Arial',
  fontSize: '14px',
  backgroundColor: '#111111',
  nodeColor: '#c6c5fe',
  nodeShape: 'box',
  nodeStyle: 'rounded',
  noDependencyColor: '#cfffac',
  cyclicNodeColor: '#ff6c60',
  edgeColor: '#757575',
  graphVizOptions: false,
  graphVizPath: false,
  dependencyFilter: false,
}

// class Madge {
//   /**
//    * Return a list of modules that depends on the given module.
//    * @api public
//    * @param  {String} id
//    * @return {Array}
//    */
//   depends(id) {
//     const tree = this.obj()

//     return Object.keys(tree).filter(dep => tree[dep].indexOf(id) >= 0)
//   }

//   /**
//    * Return a list of modules that no one is depending on.
//    * @api public
//    * @return {Array}
//    */
//   orphans() {
//     const tree = this.obj()
//     const map = {}

//     Object.keys(tree).forEach(dep => {
//       tree[dep].forEach(id => {
//         map[id] = true
//       })
//     })

//     return Object.keys(tree).filter(dep => !map[dep])
//   }

//   /**
//    * Return a list of modules that have no dependencies.
//    * @api public
//    * @return {Array}
//    */
//   leaves() {
//     const tree = this.obj()
//     return Object.keys(tree).filter(key => !tree[key].length)
//   }

//   /**
//    * Return the module dependency graph as DOT output.
//    * @api public
//    * @param  {Boolean} circularOnly
//    * @return {Promise}
//    */
//   dot(circularOnly) {
//     return graph.dot(
//       circularOnly ? this.circularGraph() : this.obj(),
//       this.circular(),
//       this.config
//     )
//   }

//   /**
//    * Write dependency graph to image.
//    * @api public
//    * @param  {String} imagePath
//    * @param  {Boolean} circularOnly
//    * @return {Promise}
//    */
//   image(imagePath, circularOnly) {
//     if (!imagePath) {
//       return Promise.reject(new Error('imagePath not provided'))
//     }

//     return graph.image(
//       circularOnly ? this.circularGraph() : this.obj(),
//       this.circular(),
//       imagePath,
//       this.config
//     )
//   }

//   /**
//    * Return Buffer with XML SVG representation of the dependency graph.
//    * @api public
//    * @return {Promise}
//    */
//   svg() {
//     return graph.svg(this.obj(), this.circular(), this.config)
//   }
// }

// /**
//  * Expose API.
//  * @param {String|Array} path
//  * @param {Object} config
//  * @return {Promise}
//  */
// module.exports = (path, config) => new Madge(path, config)
