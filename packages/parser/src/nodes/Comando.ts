import { ParseTree } from "antlr4ng";

import { Node } from "./Node.js";

export class Comando<T extends ParseTree = ParseTree> extends Node<T> {}
