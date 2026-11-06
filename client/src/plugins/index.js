/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
//  */

// Custom
import helpers from './globalFunc.js'

// console.log('helpers ', helpers)

// const myPlugin = {
//   install() {
//       Vue.helpers = helpers;
//       Vue.prototype.$helpers = helpers;
//   }
// }


export function registerPlugins (app) {
  app
    .use(helpers, {
      greetings: {
        hello: 'Bonjour!'
      }
    })
}
