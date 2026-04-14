// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { WebUIElement, attr } from '@microsoft/webui-framework';
import '#molecules/cb-search-bar/cb-search-bar.js';

export class CbHeader extends WebUIElement {
  @attr searchQuery = '';
}

CbHeader.define('cb-header');
