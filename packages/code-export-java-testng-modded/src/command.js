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
import location from './location'
import selection from './selection'

const DEF_TIMEOUT = 30000

export const emitters = {
  addSelection: emitSelect,
  answerOnNextPrompt: skip,
  assert: emitAssert,
  assertAlert: emitAssertAlert,
  assertChecked: emitVerifyChecked,
  assertConfirmation: emitAssertAlert,
  assertEditable: emitVerifyEditable,
  assertElementPresent: emitVerifyElementPresent,
  assertElementNotPresent: emitVerifyElementNotPresent,
  assertNotChecked: emitVerifyNotChecked,
  assertNotEditable: emitVerifyNotEditable,
  assertNotSelectedValue: emitVerifyNotSelectedValue,
  assertNotText: emitVerifyNotText,
  assertPrompt: emitAssertAlert,
  assertSelectedLabel: emitVerifySelectedLabel,
  assertSelectedValue: emitVerifySelectedValue,
  assertValue: emitVerifyValue,
  assertValueCaseInsensitive: emitVerifyValueCaseInsensitive,
  assertText: emitVerifyText,
  assertTextCaseInsensitive: emitVerifyTextCaseInsensitive,
  assertCss: emitAssertCss,
  assertTitle: emitVerifyTitle,
  check: emitCheck,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  click: emitClick,
  clickAt: emitClick,
  contextMenu: emitContext,
  contextMenuAt: emitContext,
  close: emitClose,
  debugger: skip,
  do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  echo: emitEcho,
  editContent: emitEditContent,
  else: emitControlFlowElse,
  elseIf: emitControlFlowElseIf,
  end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  forEach: emitControlFlowForEach,
  if: emitControlFlowIf,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  open: emitOpen,
  pause: emitPause,
  removeSelection: emitSelect,
  repeatIf: emitControlFlowRepeatIf,
  //run: emitRun,
  execMethod: emitExecMethod,
  runScript: emitRunScript,
  select: emitSelect,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
  sendKeys: emitSendKeys,
  setSpeed: emitSetSpeed,
  setWindowSize: emitSetWindowSize,
  store: emitStore,
  storeAttribute: emitStoreAttribute,
  //storeJson: emitStoreJson,
  storeText: emitStoreText,
  storeTitle: emitStoreTitle,
  storeValue: emitStoreValue,
  storeWindowHandle: emitStoreWindowHandle,
  storeXpathCount: emitStoreXpathCount,
  submit: emitSubmit,
  times: emitControlFlowTimes,
  type: emitType,
  uncheck: emitUncheck,
  verify: emitAssert,
  verifyChecked: emitVerifyChecked,
  verifyEditable: emitVerifyEditable,
  verifyElementPresent: emitVerifyElementPresent,
  verifyElementNotPresent: emitVerifyElementNotPresent,
  verifyNotChecked: emitVerifyNotChecked,
  verifyNotEditable: emitVerifyNotEditable,
  verifyNotSelectedValue: emitVerifyNotSelectedValue,
  verifyNotText: emitVerifyNotText,
  verifySelectedLabel: emitVerifySelectedLabel,
  verifySelectedValue: emitVerifySelectedValue,
  verifyText: emitVerifyText,
  verifyTextCaseInsensitive: emitVerifyTextCaseInsensitive,
  verifyTitle: emitVerifyTitle,
  verifyValue: emitVerifyValue,
  verifyValueCaseInsnitive: emitVerifyValueCaseInsensitive,
  waitForElementEditable: emitWaitForElementEditable,
  waitForElementPresent: emitWaitForElementPresent,
  waitForElementVisible: emitWaitForElementVisible,
  waitForElementNotEditable: emitWaitForElementNotEditable,
  waitForElementNotPresent: emitWaitForElementNotPresent,
  waitForElementNotVisible: emitWaitForElementNotVisible,
  waitForText: emitWaitForText,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
  waitForDOMToSettle: emitWaitForDOMToSettle
}

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!emitters[commandName]
}

function variableLookup(varName) {
  return `vars.get("${varName}").toString()`
}

function variableSetter(varName, value) {
  return varName ? `vars.put("${varName}", ${value});` : ''
}

function emitWaitForDOMToSettle(_, timeout)
{
  return Promise.resolve(
    `com.jedox.qa.engines.testng_web.framework.util.WebDriverUtils.waitForDOMToSettle(driver, ${timeout}, null);`
  )
}

function emitWaitForWindow() {
  const generateMethodDeclaration = name => {
    return `public String ${name}(int timeout) {`
  }
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: 'Thread.sleep(timeout);' },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'java.util.Set<String> whNow = driver.getWindowHandles();' },
    {
      level: 0,
      statement:
        'java.util.Set<String> whThen = (Set<String>) vars.get("window_handles");',
    },
    { level: 0, statement: 'if (whNow.size() > whThen.size()) {' },
    { level: 1, statement: 'whNow.removeAll(whThen);' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'return whNow.iterator().next();' },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(command, emittedCommand) {
  return Promise.resolve(
    `vars.put("window_handles", driver.getWindowHandles());\n${await emittedCommand}\nvars.put("${
      command.windowHandleName
    }", waitForWindow(${command.windowTimeout}));`
  )
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `org.testng.Assert.assertEquals(vars.get("${varName}").toString(), "${value}");`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(
    `org.hamcrest.MatcherAssert.assertThat(driver.switchTo().alert().getText(), org.hamcrest.CoreMatchers.is("${alertText}"));`
  )
}

function emitAnswerOnNextPrompt(textToSend) {
  const commands = [
    { level: 0, statement: '{' },
    { level: 1, statement: 'org.openqa.selenium.Alert alert = driver.switchTo().alert();' },
    { level: 1, statement: `alert.sendKeys("${textToSend}")` },
    { level: 1, statement: 'alert.accept();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (!element.isSelected()) {' },
    { level: 2, statement: 'element.click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`driver.switchTo().alert().dismiss();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`driver.switchTo().alert().accept();`)
}

async function emitClick(target) {
  const preCommands = await emitWaitForElementVisible(target, DEF_TIMEOUT)

  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `driver.findElement(${await location.emit(
          target
        )}).click();`,
      },
    ]),
  })
}

async function emitContext(target) {
  const preCommands = await emitWaitForElementVisible(target, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        target
      )});`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    { level: 1, statement: 'builder.contextClick(element).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitClose() {
  return Promise.resolve(`driver.close();`)
}

function generateExpressionScript(script) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(Boolean) js.executeScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{ level: 0, statement: 'do {' }],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{ level: 0, statement: '} else {' }],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} else if (${generateExpressionScript(script)}) {`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `}` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  const collectionName = exporter.parsers.capitalize(collectionVarName)
  const iteratorName = exporter.parsers.capitalize(iteratorVarName)
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `java.util.ArrayList collection${collectionName} = (java.util.ArrayList) vars.get("${collectionVarName}");`,
      },
      {
        level: 0,
        statement: `for (int i${iteratorName} = 0; i < collection${collectionName}.size() - 1; i${iteratorName}++) {`,
      },
      {
        level: 1,
        statement: `vars.put("${iteratorVarName}", collection${collectionName}.get(i));`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `} while (${generateExpressionScript(script)});` },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target) {
  const commands = [
    { level: 0, statement: `Integer times = ${target};` },
    { level: 0, statement: 'for(int i = 0; i < times; i++) {' },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target) {
  const preCommands = await emitWaitForElementVisible(target, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        target
      )});`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    { level: 1, statement: 'builder.doubleClick(element).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitDragAndDrop(dragged, dropped) {
  let preCommands = []
  preCommands = preCommands.concat(
    (await emitWaitForElementVisible(dragged, DEF_TIMEOUT)).commands
  )
  preCommands = preCommands.concat(
    (await emitWaitForElementVisible(dropped, DEF_TIMEOUT)).commands
  )
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement dragged = driver.findElement(${await location.emit(
        dragged
      )});`,
    },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement dropped = driver.findElement(${await location.emit(
        dropped
      )});`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    { level: 1, statement: 'builder.dragAndDrop(dragged, dropped).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.concat(commands) })
}

async function emitEcho(message) {
  const _message = message.startsWith('vars.get') ? message : `"${message}"`
  return Promise.resolve(`System.out.println(${_message});`)
}

async function emitEditContent(locator, content) {
  const preCommands = await emitWaitForElementEditable(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `js.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitExecuteScript(script, varName) {
  const result = `js.executeScript("${script.script}"${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script, varName) {
  const result = `js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map(varName => `vars.get("${varName}")`)
    .join(',')}`
}

async function emitMouseDown(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    {
      level: 1,
      statement: 'builder.moveToElement(element).clickAndHold().perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitMouseMove(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    { level: 1, statement: 'builder.moveToElement(element).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(By.tagName("body"));`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    { level: 1, statement: 'builder.moveToElement(element, 0, 0).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'org.openqa.selenium.interactions.Actions builder = new org.openqa.selenium.interactions.Actions(driver);' },
    {
      level: 1,
      statement: 'builder.moveToElement(element).release().perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return Promise.resolve(`driver.get(${url});`)
}

async function emitPause(time) {
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: `Thread.sleep(${time});` },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitRun() {
  // run won't be emitted as command..
  // We'll have to handle this differently.
  // return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
  return Promise.resolve('')
}
async function emitExecMethod(testName) {
  if (testName.includes('.')) {
    let parts = testName.split('#')

    if (parts.length !== 2) throw 'Not valid'

    let clsName = parts[0]
    let methodName = parts[1]

    return Promise.resolve(
      `(new ${clsName}()).${exporter.parsers.uncapitalize(methodName)}();`
    )
  } else {
    return Promise.resolve(`${exporter.parsers.uncapitalize(testName)}();`)
  }
}

async function emitRunScript(script) {
  return Promise.resolve(
    `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  )
}

async function emitSetWindowSize() {
  return Promise.resolve('')
}

async function emitSelect(selectElement, option) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement dropdown = driver.findElement(${await location.emit(
        selectElement
      )});`,
    },
    {
      level: 1,
      statement: `dropdown.findElement(${await selection.emit(
        option
      )}).click();`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('driver.switchTo().defaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `driver.switchTo().frame(${Math.floor(
        frameLocation.split('index=')[1]
      )});`
    )
  } else {
    const preCommands = await emitWaitForElementVisible(
      frameLocation,
      DEF_TIMEOUT
    )

    return Promise.resolve({
      commands: preCommands.commands.concat([
        { level: 0, statement: '{' },
        {
          level: 1,
          statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
            frameLocation
          )});`,
        },
        { level: 1, statement: 'driver.switchTo().frame(element);' },
        { level: 0, statement: '}' },
      ]),
    })
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window(${windowLocation.split('handle=')[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window("${windowLocation.split('name=')[1]}");`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'java.util.ArrayList<String> handles = new java.util.ArrayList<String>(driver.getWindowHandles());',
          },
          { level: 1, statement: 'driver.switchTo().window(handles.get(0));' },
          { level: 0, statement: '}' },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'java.util.ArrayList<String> handles = new java.util.ArrayList<String>(driver.getWindowHandles());',
          },
          {
            level: 1,
            statement: `driver.switchTo().window(handles.get(${index}));`,
          },
          { level: 0, statement: '}' },
        ],
      })
    }
  } else {
    return Promise.reject(
      new Error('Can only emit `select window` using handles')
    )
  }
}

function generateSendKeysInput(value) {
  if (typeof value === 'object') {
    return value
      .map(s => {
        if (s.startsWith('vars.get')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `org.openqa.selenium.Keys.${key}`
        } else {
          return `"${s}"`
        }
      })
      .join(', ')
  } else {
    if (value.startsWith('vars.get')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target, value) {
  const preCommands = await emitWaitForElementVisible(target, DEF_TIMEOUT)

  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `driver.findElement(${await location.emit(
          target
        )}).sendKeys(${generateSendKeysInput(value)});`,
      },
    ]),
  })
}

function emitSetSpeed() {
  return Promise.resolve(
    `System.out.println("\`set speed\` is a no-op in code export, use \`pause\` instead");`
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)

  const preCommands = await emitWaitForElementVisible(
    elementLocator,
    DEF_TIMEOUT
  )
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        elementLocator
      )});`,
    },
    {
      level: 1,
      statement: `String attribute = element.getAttribute("${attributeName}");`,
    },
    { level: 1, statement: `${variableSetter(varName, 'attribute')}` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

//async function emitStoreJson(_json, _varName) {
//  // TODO
//  return Promise.resolve('')
//}

async function emitStoreText(locator, varName) {
  const result = `driver.findElement(${await location.emit(locator)}).getText()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(variableSetter(varName, 'driver.getTitle()'))
}

async function emitStoreValue(locator, varName) {
  const result = `driver.findElement(${await location.emit(
    locator
  )}).getAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName) {
  return Promise.resolve(variableSetter(varName, 'driver.getWindowHandle()'))
}

async function emitStoreXpathCount(locator, varName) {
  const result = `driver.findElements(${await location.emit(locator)}).size()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `throw new Error("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  )
}

async function emitType(target, value) {
  const preCommands = await emitWaitForElementVisible(target, DEF_TIMEOUT)

  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `driver.findElement(${await location.emit(
          target
        )}).sendKeys(${generateSendKeysInput(value)});`,
      },
    ]),
  })
}

async function emitUncheck(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (element.isSelected()) {' },
    { level: 2, statement: 'element.click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitVerifyChecked(locator) {
  const preCommands = await emitWaitForElementPresent(locator, DEF_TIMEOUT)

  return Promise.resolve(
      {
          commands: preCommands.commands.concat({
              level: 0,
              statement: `org.testng.Assert.assertTrue(driver.findElement(${await location.emit(
                  locator
              )}).isSelected());`,
          })
      }
  )
}

async function emitVerifyEditable(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;',
    },
    { level: 1, statement: 'org.testng.Assert.assertTrue(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitVerifyElementPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `java.util.List<org.openqa.selenium.WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'org.testng.Assert.assertTrue(elements.size() > 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `java.util.List<org.openqa.selenium.WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'org.testng.Assert.assertTrue(elements.size() == 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator) {
  const preCommands = await emitWaitForElementPresent(locator, DEF_TIMEOUT)

  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `org.testng.Assert.assertFalse(driver.findElement(${await location.emit(
          locator
        )}).isSelected());`,
      },
    ]),
  })
}

async function emitVerifyNotEditable(locator) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;',
    },
    { level: 1, statement: 'org.testng.Assert.assertFalse(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    {
      level: 1,
      statement: `org.hamcrest.MatcherAssert.assertThat(value, org.hamcrest.CoreMatchers.is(org.hamcrest.CoreMatchers.not("${expectedValue}")));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitVerifyNotText(locator, text) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const result = `driver.findElement(${await location.emit(locator)}).getText()`
  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `org.hamcrest.MatcherAssert.assertThat(${result}, org.hamcrest.CoreMatchers.is(org.hamcrest.CoreMatchers.not("${text}")));`,
      },
    ]),
  })
}

async function emitVerifySelectedLabel(locator, labelValue) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'String value = element.getAttribute("value");' },
    {
      level: 1,
      statement: `String locator = String.format("option[@value='%s']", value);`,
    },
    {
      level: 1,
      statement:
        'String selectedText = element.findElement(org.openqa.selenium.By.xpath(locator)).getText();',
    },
    { level: 1, statement: `org.hamcrest.MatcherAssert.assertThat(selectedText, org.hamcrest.CoreMatchers.is("${labelValue}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands: preCommands.commands.concat(commands),
  })
}

async function emitVerifySelectedValue(locator, value) {
  return emitVerifyValue(locator, value)
}

async function emitAssertCss(locator, css)
{
    const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

    return Promise.resolve({
        commands: preCommands.commands.concat([
            {
                level: 0,
                statement: `this.assertCSS(driver.findElement(${await location.emit(
                    locator
                )}), "${css}");`,
            },
        ]),
    })
}

async function emitVerifyText(locator, text) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `org.hamcrest.MatcherAssert.assertThat(driver.findElement(${await location.emit(
          locator
        )}).getText(), org.hamcrest.CoreMatchers.is("${text}"));`,
      },
    ]),
  })
}


async function emitVerifyTextCaseInsensitive(locator, text) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  text = text.toLowerCase();

  return Promise.resolve({
    commands: preCommands.commands.concat([
      {
        level: 0,
        statement: `org.hamcrest.MatcherAssert.assertThat(driver.findElement(${await location.emit(
        locator
        )}).getText().toLowerCase(), org.hamcrest.CoreMatchers.is("${text}"));`,
      },
    ]),
  })
}

async function emitVerifyValue(locator, value) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    { level: 1, statement: `org.hamcrest.MatcherAssert.assertThat(value, org.hamcrest.CoreMatchers.is("${value}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitVerifyValueCaseInsensitive(locator, value) {
  const preCommands = await emitWaitForElementVisible(locator, DEF_TIMEOUT)

  value = value.toLowerCase();

  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value").toLowerCase();`,
    },
    { level: 1, statement: `org.hamcrest.MatcherAssert.assertThat(value, org.hamcrest.CoreMatchers.is("${value}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands: preCommands.commands.concat(commands) })
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`org.hamcrest.MatcherAssert.assertThat(driver.getTitle(), org.hamcrest.CoreMatchers.is("${title}"));`)
}

async function emitWaitForElementEditable(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForText(locator, text) {
  const timeout = 30000
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(org.openqa.selenium.support.ui.ExpectedConditions.textToBe(${await location.emit(
        locator
      )}, "${text}"));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(org.openqa.selenium.support.ui.ExpectedConditions.not(ExpectedConditions.elementToBeClickable(${await location.emit(
        locator
      )})));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator, timeout) {
  const commands = [
    { level: 0, statement: 'try{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `org.openqa.selenium.WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: 'wait.until(org.openqa.selenium.support.ui.ExpectedConditions.stalenessOf(element));',
    },
    { level: 0, statement: '}catch(Exception e){e.printStackTrace();}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotVisible(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `org.openqa.selenium.support.ui.WebDriverWait wait = new org.openqa.selenium.support.ui.WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow },
}
