/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function sendInlineCompletionsEndOfLifeTelemetry(dataChannel, endOfLifeSummary) {
    dataChannel.publicLog2('inlineCompletion.endOfLife', endOfLifeSummary);
}
//# sourceMappingURL=telemetry.js.map