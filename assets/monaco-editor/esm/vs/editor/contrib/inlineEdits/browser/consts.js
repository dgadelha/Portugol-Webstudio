/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export const inlineEditAcceptId = 'editor.action.inlineEdits.accept';
export const showPreviousInlineEditActionId = 'editor.action.inlineEdits.showPrevious';
export const showNextInlineEditActionId = 'editor.action.inlineEdits.showNext';
export const inlineEditVisible = new RawContextKey('inlineEditsVisible', false, localize('inlineEditsVisible', "Whether an inline edit is visible"));
export const isPinnedContextKey = new RawContextKey('inlineEditsIsPinned', false, localize('isPinned', "Whether an inline edit is visible"));
