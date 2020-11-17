// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { codeExport as exporter } from '@seleniumhq/side-utils'
import emitter from './command'
import location from './location'
import { generateHooks, generateMethodHooks } from './hook'
import uuidv4 from 'uuid/v4'

// Define language options
export const displayName = 'Java TestNG Modded'

export let opts = {}
opts.emitter = emitter
opts.hooks = generateHooks()
opts.fileExtension = '.java'
opts.commandPrefixPadding = '  '
opts.terminatingKeyword = '}'
opts.commentPrefix = '//'
opts.generateMethodDeclaration = generateMethodDeclaration

// Create generators for dynamic string creation of primary entities (e.g., filename, methods, test, and suite)
function generateTestDeclaration(tests, name) {
  let pkg = ''
  let cls = ''

  if (
    !this ||
    !this.name ||
    !this.additionalOpts ||
    !this.additionalOpts.package
  ) {
    throw new Error('Package and name must be specified')
  }

  pkg = this.additionalOpts.package
  cls = exporter.parsers.sanitizeName(this.name)

  let testName = exporter.parsers.uncapitalize(
    exporter.parsers.sanitizeName(name)
  )

  let thisTest = tests.find(e => e.name === name)

  if (thisTest === undefined) throw new Error('This should be impossible')

  let dependency = ''

  let runCommand = thisTest.commands.find(c => c.command === 'dependsOn')

  if (runCommand !== undefined) {
    if (runCommand.target.includes('.')) dependency = runCommand.target
    else dependency = `${pkg}.${cls}#${runCommand.target}`
  }

  let clsGroup = `${pkg}.${cls}`
  let methodGroup = `${clsGroup}#${name}`

  return `@org.testng.annotations.Test(groups={${testName.includes('___proxy') ? '' : '"' + clsGroup + '",'}"${methodGroup}"}${
    dependency ? `, dependsOnGroups={"${dependency}"}` : ''
  })\npublic void ${testName}() {`
}

function generateMethodDeclaration(name) {
  return `public void ${exporter.parsers.sanitizeName(name)}() {`
}
function generateSuiteDeclaration(name) {
  return `public class ${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )} extends com.jedox.qa.engines.testng_web.framework.testexec.Loader {`
}
function generateFilename(name) {
  return `${exporter.parsers.sanitizeName(name)}${opts.fileExtension}`
}

// Emit an individual test, wrapped in a suite (using the test name as the suite name)
export async function emitTest({
  baseUrl,
  test,
  tests,
  project,
  enableOriginTracing,
  enableDescriptionAsComment,
  beforeEachOptions,
}) {
  // regen hooks
  opts.hooks = generateHooks(test)

  global.baseUrl = baseUrl
  const testDeclaration = generateTestDeclaration.bind(test, tests)(test.name)
  const result = await exporter.emit.test(test, tests, {
    ...opts,
    testDeclaration,
    enableOriginTracing,
    enableDescriptionAsComment,
    project,
  })
  const suiteName = test.name
  const suiteDeclaration = generateSuiteDeclaration(suiteName)
  const _suite = await exporter.emit.suite(result, tests, {
    ...opts,
    suiteDeclaration,
    suiteName,
    project,
    beforeEachOptions,
  })
  return {
    filename: generateFilename(test.name),
    body: exporter.emit.orderedSuite(_suite),
  }
}

// Emit a suite with all of its tests
export async function emitSuite({
  baseUrl,
  suite,
  tests,
  project,
  enableOriginTracing,
  beforeEachOptions,
  enableDescriptionAsComment,
}) {

  tests.filter(t => t.external === false).forEach(t => {
    if (t.commands.length && t.commands[0].command === 'run') {
      let runCommand = t.commands[0]
      let target = runCommand.target

      let n = `___${target.replace(/\./g, '_').replace('#', '__')}___${
        t.name
      }____proxy`

      tests.push({
        id: uuidv4(),
        name: n,
        external: false,
        commands: [
          {
            id: uuidv4(),
            command: 'execMethod',
            target: target,
            comment: '',
            value: '',
          },
        ],
      })

      t.commands[0].command = 'dependsOn'
      t.commands[0].target = n

      suite.tests.push(n)
    }
  })

  // look for run,

  // regen hooks
  opts.hooks = generateHooks(suite)

  global.baseUrl = baseUrl
  const result = await exporter.emit.testsFromSuite(tests, suite, opts, {
    enableOriginTracing,
    enableDescriptionAsComment,
    generateTestDeclaration: generateTestDeclaration.bind(suite, tests),
    project,
    hooks: generateMethodHooks()
  })
  const suiteDeclaration = generateSuiteDeclaration(suite.name)
  const _suite = await exporter.emit.suite(result, tests, {
    ...opts,
    suiteDeclaration,
    suite,
    project,
    beforeEachOptions,
  })
  return {
    filename: generateFilename(suite.name),
    body: exporter.emit.orderedSuite(_suite),
  }
}

export default {
  emit: {
    test: emitTest,
    suite: emitSuite,
    locator: location.emit,
  },
  register: {
    command: emitter.register,
    variable: opts.hooks.declareVariables.register,
    dependency: opts.hooks.declareDependencies.register,
    beforeAll: opts.hooks.beforeAll.register,
    beforeEach: opts.hooks.beforeEach.register,
    afterEach: opts.hooks.afterEach.register,
    afterAll: opts.hooks.afterAll.register,
    inEachBegin: opts.hooks.inEachBegin.register,
    inEachEnd: opts.hooks.inEachEnd.register,
  },
}
