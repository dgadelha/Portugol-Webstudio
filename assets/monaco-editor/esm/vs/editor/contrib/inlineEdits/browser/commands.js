/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from '../../../../base/common/codicons.js';
import { transaction } from '../../../../base/common/observable.js';
import { asyncTransaction } from '../../../../base/common/observableInternal/base.js';
import { EditorAction } from '../../../browser/editorExtensions.js';
import { EmbeddedCodeEditorWidget } from '../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js';
import { EditorContextKeys } from '../../../common/editorContextKeys.js';
import { inlineEditAcceptId, inlineEditVisible, showNextInlineEditActionId, showPreviousInlineEditActionId } from './consts.js';
import { InlineEditsController } from './inlineEditsController.js';
import * as nls from '../../../../nls.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
function labelAndAlias(str) {
    return {
        label: str.value,
        alias: str.original,
    };
}
export class ShowNextInlineEditAction extends EditorAction {
    static { this.ID = showNextInlineEditActionId; }
    constructor() {
        super({
            id: ShowNextInlineEditAction.ID,
            ...labelAndAlias(nls.localize2('action.inlineEdits.showNext', "Show Next Inline Edit")),
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, inlineEditVisible),
            kbOpts: {
                weight: 100,
                primary: 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */,
            },
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditsController.get(editor);
        controller?.model.get()?.next();
    }
}
export class ShowPreviousInlineEditAction extends EditorAction {
    static { this.ID = showPreviousInlineEditActionId; }
    constructor() {
        super({
            id: ShowPreviousInlineEditAction.ID,
            ...labelAndAlias(nls.localize2('action.inlineEdits.showPrevious', "Show Previous Inline Edit")),
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, inlineEditVisible),
            kbOpts: {
                weight: 100,
                primary: 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */,
            },
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditsController.get(editor);
        controller?.model.get()?.previous();
    }
}
export class TriggerInlineEditAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineEdits.trigger',
            ...labelAndAlias(nls.localize2('action.inlineEdits.trigger', "Trigger Inline Edit")),
            precondition: EditorContextKeys.writable
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditsController.get(editor);
        await asyncTransaction(async (tx) => {
            /** @description triggerExplicitly from command */
            await controller?.model.get()?.triggerExplicitly(tx);
        });
    }
}
export class AcceptInlineEdit extends EditorAction {
    constructor() {
        super({
            id: inlineEditAcceptId,
            ...labelAndAlias(nls.localize2('action.inlineEdits.accept', "Accept Inline Edit")),
            precondition: inlineEditVisible,
            menuOpts: {
                menuId: MenuId.InlineEditsActions,
                title: nls.localize('inlineEditsActions', "Accept Inline Edit"),
                group: 'primary',
                order: 1,
                icon: Codicon.check,
            },
            kbOpts: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
                weight: 20000,
                kbExpr: inlineEditVisible,
            }
        });
    }
    async run(accessor, editor) {
        if (editor instanceof EmbeddedCodeEditorWidget) {
            editor = editor.getParentEditor();
        }
        const controller = InlineEditsController.get(editor);
        if (controller) {
            controller.model.get()?.accept(controller.editor);
            controller.editor.focus();
        }
    }
}
/*
TODO@hediet
export class PinInlineEdit extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineEdits.pin',
            ...labelAndAlias(nls.localize2('action.inlineEdits.pin', "Pin Inline Edit")),
            precondition: undefined,
            kbOpts: {
                primary: KeyMod.Shift | KeyCode.Space,
                weight: 20000,
            }
        });
    }

    public async run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void> {
        const controller = InlineEditsController.get(editor);
        if (controller) {
            controller.model.get()?.togglePin();
        }
    }
}

MenuRegistry.appendMenuItem(MenuId.InlineEditsActions, {
    command: {
        id: 'editor.action.inlineEdits.pin',
        title: nls.localize('Pin', "Pin"),
        icon: Codicon.pin,
    },
    group: 'primary',
    order: 1,
    when: isPinnedContextKey.negate(),
});

MenuRegistry.appendMenuItem(MenuId.InlineEditsActions, {
    command: {
        id: 'editor.action.inlineEdits.unpin',
        title: nls.localize('Unpin', "Unpin"),
        icon: Codicon.pinned,
    },
    group: 'primary',
    order: 1,
    when: isPinnedContextKey,
});*/
export class HideInlineEdit extends EditorAction {
    static { this.ID = 'editor.action.inlineEdits.hide'; }
    constructor() {
        super({
            id: HideInlineEdit.ID,
            ...labelAndAlias(nls.localize2('action.inlineEdits.hide', "Hide Inline Edit")),
            precondition: inlineEditVisible,
            kbOpts: {
                weight: 100,
                primary: 9 /* KeyCode.Escape */,
            }
        });
    }
    async run(accessor, editor) {
        const controller = InlineEditsController.get(editor);
        transaction(tx => {
            controller?.model.get()?.stop(tx);
        });
    }
}
