/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Derived } from '../observables/derivedImpl.js';
import { FromEventObservable } from '../observables/observableFromEvent.js';
import { ObservableValue } from '../observables/observableValue.js';
import { AutorunObserver } from '../reactions/autorunImpl.js';
import { formatValue } from './consoleObservableLogger.js';
export function debugGetDependencyGraph(obs, options) {
    const debugNamePostProcessor = options?.debugNamePostProcessor ?? ((str) => str);
    const info = Info.from(obs, debugNamePostProcessor);
    if (!info) {
        return '';
    }
    const alreadyListed = new Set();
    return formatObservableInfo(info, 0, alreadyListed).trim();
}
function formatObservableInfo(info, indentLevel, alreadyListed) {
    const indent = '\t\t'.repeat(indentLevel);
    const lines = [];
    const isAlreadyListed = alreadyListed.has(info.sourceObj);
    if (isAlreadyListed) {
        lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
        return lines.join('\n');
    }
    alreadyListed.add(info.sourceObj);
    lines.push(`${indent}* ${info.type} ${info.name}:`);
    lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
    lines.push(`${indent}  state: ${info.state}`);
    if (info.dependencies.length > 0) {
        lines.push(`${indent}  dependencies:`);
        for (const dep of info.dependencies) {
            lines.push(formatObservableInfo(dep, indentLevel + 1, alreadyListed));
        }
    }
    return lines.join('\n');
}
class Info {
    static from(obs, debugNamePostProcessor) {
        if (obs instanceof AutorunObserver) {
            const state = obs.debugGetState();
            return new Info(obs, debugNamePostProcessor(obs.debugName), 'autorun', undefined, state.stateStr, Array.from(state.dependencies).map(dep => Info.from(dep, debugNamePostProcessor) || Info.unknown(dep)));
        }
        else if (obs instanceof Derived) {
            const state = obs.debugGetState();
            return new Info(obs, debugNamePostProcessor(obs.debugName), 'derived', state.value, state.stateStr, Array.from(state.dependencies).map(dep => Info.from(dep, debugNamePostProcessor) || Info.unknown(dep)));
        }
        else if (obs instanceof ObservableValue) {
            const state = obs.debugGetState();
            return new Info(obs, debugNamePostProcessor(obs.debugName), 'observableValue', state.value, 'upToDate', []);
        }
        else if (obs instanceof FromEventObservable) {
            const state = obs.debugGetState();
            return new Info(obs, debugNamePostProcessor(obs.debugName), 'fromEvent', state.value, state.hasValue ? 'upToDate' : 'initial', []);
        }
        return undefined;
    }
    static unknown(obs) {
        return new Info(obs, '(unknown)', 'unknown', undefined, 'unknown', []);
    }
    constructor(sourceObj, name, type, value, state, dependencies) {
        this.sourceObj = sourceObj;
        this.name = name;
        this.type = type;
        this.value = value;
        this.state = state;
        this.dependencies = dependencies;
    }
}
//# sourceMappingURL=debugGetDependencyGraph.js.map