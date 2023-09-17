export default function plopFile(plop) {
  // https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
  plop.setHelper('compare', function compare(v1, operator, v2, options) {
    const a = options.fn(this)
    const b = options.inverse(this)
    switch (operator) {
      case '==':
        // eslint-disable-next-line eqeqeq
        return v1 == v2 ? a : b
      case '===':
        return v1 === v2 ? a : b
      case '!=':
        // eslint-disable-next-line eqeqeq
        return v1 != v2 ? a : b
      case '!==':
        return v1 !== v2 ? a : b
      case '<':
        return v1 < v2 ? a : b
      case '<=':
        return v1 <= v2 ? a : b
      case '>':
        return v1 > v2 ? a : b
      case '>=':
        return v1 >= v2 ? a : b
      case '&&':
        return v1 && v2 ? a : b
      case '||':
        return v1 || v2 ? a : b
      default:
        return b
    }
  })
  plop.setGenerator('workspace', {
    description: 'create a new workspace',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name your workspace',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Describe your workspace',
      },
      {
        type: 'list',
        name: 'kind',
        message: 'What kind of workspace is this?',
        choices: ['apps', 'scripts', 'packages', 'tools', 'shared'],
      },
    ],
    actions: [
      {
        type: 'add',
        path: '{{kind}}/{{name}}/package.json',
        templateFile: 'plop-templates/workspace-package-json.hbs',
      },
      {
        type: 'add',
        path: '{{kind}}/{{name}}/jest.config.cjs',
        templateFile: 'plop-templates/workspace-jest-config-cjs.hbs',
      },
      {
        type: 'add',
        path: '{{kind}}/{{name}}/package-scripts.cjs',
        templateFile: 'plop-templates/workspace-package-scripts.hbs',
      },
    ],
  })
}
