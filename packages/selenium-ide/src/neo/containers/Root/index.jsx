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

import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { configure } from 'mobx'
import Panel from '../Panel'
import { isJDXQACompatible, getJDXServerURL } from '../../../common/utils'
import { environment as env } from '../../../../../side-utils'

configure({
  enforceActions: 'observed',
})

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  )
}

if (isJDXQACompatible) {
  fetch(getJDXServerURL('/healthz'))
    .then(resp => resp.json())
    .then(json => {
      if (!json.VERSION) {
        alert("QA server didn't provide version info")
        window.close()
      }

      env.setFeatures(json.FEATURES || {});

      if(json.HOST)
        env.setHost(json.HOST);

      render(Panel)
    })
    .catch(err => {
      alert(
        `QA server is not available, please start it and then run the extension [ ${JSON.stringify(
          err
        )} ]`
      )
      window.close()
    })
} else {
  render(Panel)
}

if (module.hot) {
  module.hot.accept('../Panel/index.jsx', () => {
    // eslint-disable-next-line node/no-missing-require
    const NextRootContainer = require('../Panel').default
    render(NextRootContainer)
  })
}
