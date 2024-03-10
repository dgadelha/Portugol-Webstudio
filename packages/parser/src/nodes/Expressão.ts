import { ParseTree } from "antlr4ng";

import { Node } from "./Node.js";

export class Expressão<T extends ParseTree = ParseTree> extends Node<T> {}
