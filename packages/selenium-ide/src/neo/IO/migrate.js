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

import migrations from './migrations'

export const VERSIONS = ['1.0', '1.1', '2.0']

import { environment as env } from '../../../../side-utils';

function replaceURL(url)
{
  let u = new URL(url);
  u.host = env.getHost().replace("127.0.0.1", "localhost");
  return u.toString();
}

export default function UpgradeProject(project) {
  let r = project
  VERSIONS.forEach(ver => {
    // if the project's version is the same as the migration, it means we've already completed that migration
    // TODO: switch to semver checks if we ever react an x.10 release
    if (+project.version < +ver) {
      Object.values(migrations[ver]).forEach(migrate => {
        r = migrate(r)
      })
      r.version = ver
    }
  })

  if(r.url)
    r.url = replaceURL(r.url);

  if(r.urls)
    r.urls = r.urls.map(replaceURL)

  return r
}
