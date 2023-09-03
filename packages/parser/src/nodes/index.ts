import {
  AdicaoContext,
  ArquivoContext,
  AtribuicaoCompostaDivisaoContext,
  AtribuicaoCompostaMultiplicacaoContext,
  AtribuicaoCompostaSomaContext,
  AtribuicaoCompostaSubtracaoContext,
  AtribuicaoContext,
  CaracterContext,
  CasoContext,
  ChamadaFuncaoContext,
  ColunaMatrizContext,
  ComandoContext,
  CondicaoContext,
  DeclaracaoArrayContext,
  DeclaracaoContext,
  DeclaracaoFuncaoContext,
  DeclaracaoMatrizContext,
  DeclaracaoVariavelContext,
  DecrementoUnarioPosfixadoContext,
  DecrementoUnarioPrefixadoContext,
  DivisaoContext,
  EnquantoContext,
  EscolhaContext,
  EscopoBibliotecaContext,
  ExpressaoEntreParentesesContext,
  FacaEnquantoContext,
  InclusaoBibliotecaContext,
  IncrementoParaContext,
  IncrementoUnarioPosfixadoContext,
  IncrementoUnarioPrefixadoContext,
  IndiceArrayContext,
  InicializacaoArrayContext,
  InicializacaoMatrizContext,
  InicializacaoParaContext,
  LinhaMatrizContext,
  ListaComandosContext,
  ListaDeclaracoesContext,
  ListaExpressoesContext,
  ListaParametrosContext,
  MaisUnarioContext,
  MenosUnarioContext,
  ModuloContext,
  MultiplicacaoContext,
  NegacaoBitwiseContext,
  NegacaoContext,
  NumeroInteiroContext,
  NumeroRealContext,
  OperacaoAndBitwiseContext,
  OperacaoDiferencaContext,
  OperacaoELogicoContext,
  OperacaoIgualdadeContext,
  OperacaoMaiorContext,
  OperacaoMaiorIgualContext,
  OperacaoMenorContext,
  OperacaoMenorIgualContext,
  OperacaoOrBitwiseContext,
  OperacaoOuLogicoContext,
  OperacaoShiftLeftContext,
  OperacaoShiftRightContext,
  OperacaoXorContext,
  ParaContext,
  ParametroContext,
  ParametroFuncaoContext,
  PareContext,
  ReferenciaArrayContext,
  ReferenciaMatrizContext,
  ReferenciaParaVariavelContext,
  RetorneContext,
  SeContext,
  SenaoContext,
  StringContext,
  SubtracaoContext,
  TamanhoArrayContext,
  ValorLogicoContext,
} from "@portugol-webstudio/antlr";

import { Arquivo } from "./Arquivo.js";
import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import { AtribuiçãoCompostaDivisãoCmd } from "./AtribuiçãoCompostaDivisãoCmd.js";
import { AtribuiçãoCompostaMultiplicaçãoCmd } from "./AtribuiçãoCompostaMultiplicaçãoCmd.js";
import { AtribuiçãoCompostaSomaCmd } from "./AtribuiçãoCompostaSomaCmd.js";
import { AtribuiçãoCompostaSubtraçãoCmd } from "./AtribuiçãoCompostaSubtraçãoCmd.js";
import { Bypass } from "./Bypass.js";
import { CadeiaExpr } from "./CadeiaExpr.js";
import { CaractereExpr } from "./CaractereExpr.js";
import { CasoCmd } from "./CasoCmd.js";
import { CasoContrárioExpr } from "./CasoContrárioExpr.js";
import { ChamadaFunçãoExpr } from "./ChamadaFunçãoExpr.js";
import { Comando } from "./Comando.js";
import { DeclaraçãoCmd } from "./DeclaraçãoCmd.js";
import { DeclaraçãoMatrizExpr } from "./DeclaraçãoMatrizExpr.js";
import { DeclaraçãoVariávelExpr } from "./DeclaraçãoVariávelExpr.js";
import { DeclaraçãoVetorExpr } from "./DeclaraçãoVetorExpr.js";
import { DecrementoUnárioPrefixadoExpr } from "./DecrementoUnárioPrefixadoExpr.js";
import { DecrementoUnárioPósfixadoExpr } from "./DecrementoUnárioPósfixadoExpr.js";
import { DivisãoExpr } from "./DivisãoExpr.js";
import { EnquantoCmd } from "./EnquantoCmd.js";
import { EscolhaCmd } from "./EscolhaCmd.js";
import { EscopoBibliotecaExpr } from "./EscopoBibliotecaExpr.js";
import { Expressão } from "./Expressão.js";
import { ExpressãoEntreParênteses } from "./ExpressãoEntreParênteses.js";
import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { ExpressãoUnária } from "./ExpressãoUnária.js";
import { FaçaEnquantoCmd } from "./FaçaEnquantoCmd.js";
import { Função } from "./Função.js";
import { InclusãoBiblioteca } from "./InclusãoBiblioteca.js";
import { IncrementoUnárioPrefixadoExpr } from "./IncrementoUnárioPrefixadoExpr.js";
import { IncrementoUnárioPósfixadoExpr } from "./IncrementoUnárioPósfixadoExpr.js";
import { InicializaçãoMatrizExpr } from "./InicializaçãoMatrizExpr.js";
import { InicializaçãoVetorExpr } from "./InicializaçãoVetorExpr.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { LógicoExpr } from "./LógicoExpr.js";
import { MaisUnárioExpr } from "./MaisUnárioExpr.js";
import { MenosUnárioExpr } from "./MenosUnárioExpr.js";
import { MultiplicaçãoExpr } from "./MultiplicaçãoExpr.js";
import { MóduloExpr } from "./MóduloExpr.js";
import { NegaçãoBitwiseExpr } from "./NegaçãoBitwiseExpr.js";
import { NegaçãoExpr } from "./NegaçãoExpr.js";
import { Node } from "./Node.js";
import { OperaçãoAndBitwiseExpr } from "./OperaçãoAndBitwiseExpr.js";
import { OperaçãoAndLógicoExpr } from "./OperaçãoAndLógicoExpr.js";
import { OperaçãoDiferençaExpr } from "./OperaçãoDiferençaExpr.js";
import { OperaçãoIgualdadeExpr } from "./OperaçãoIgualdadeExpr.js";
import { OperaçãoMaiorOuIgualQueExpr } from "./OperaçãoMaiorOuIgualQueExpr.js";
import { OperaçãoMaiorQueExpr } from "./OperaçãoMaiorQueExpr.js";
import { OperaçãoMenorOuIgualQueExpr } from "./OperaçãoMenorOuIgualQueExpr.js";
import { OperaçãoMenorQueExpr } from "./OperaçãoMenorQueExpr.js";
import { OperaçãoOrBitwiseExpr } from "./OperaçãoOrBitwiseExpr.js";
import { OperaçãoOrLógicoExpr } from "./OperaçãoOrLógicoExpr.js";
import { OperaçãoShiftLeftExpr } from "./OperaçãoShiftLeftExpr.js";
import { OperaçãoShiftRightExpr } from "./OperaçãoShiftRightExpr.js";
import { OperaçãoXorExpr } from "./OperaçãoXorExpr.js";
import { ParaCmd } from "./ParaCmd.js";
import { PareCmd } from "./PareCmd.js";
import { Parâmetro } from "./Parâmetro.js";
import { RealExpr } from "./RealExpr.js";
import { ReferênciaArrayExpr } from "./ReferênciaArrayExpr.js";
import { ReferênciaMatrizExpr } from "./ReferênciaMatrizExpr.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { RetorneCmd } from "./RetorneCmd.js";
import { SeCmd } from "./SeCmd.js";
import { SenãoCmd } from "./SenãoCmd.js";
import { SomaExpr } from "./SomaExpr.js";
import { SubtraçãoExpr } from "./SubtraçãoExpr.js";
import { UnhandledNode } from "./UnhandledNode.js";
import { VazioExpr } from "./VazioExpr.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";

export {
  Arquivo,
  AtribuiçãoCmd,
  AtribuiçãoCompostaDivisãoCmd,
  AtribuiçãoCompostaMultiplicaçãoCmd,
  AtribuiçãoCompostaSomaCmd,
  AtribuiçãoCompostaSubtraçãoCmd,
  Bypass,
  CadeiaExpr,
  CaractereExpr,
  CasoCmd,
  CasoContrárioExpr,
  ChamadaFunçãoExpr,
  Comando,
  DeclaraçãoCmd,
  DeclaraçãoMatrizExpr,
  DeclaraçãoVariávelExpr,
  DeclaraçãoVetorExpr,
  DecrementoUnárioPrefixadoExpr,
  DecrementoUnárioPósfixadoExpr,
  DivisãoExpr,
  EnquantoCmd,
  EscolhaCmd,
  EscopoBibliotecaExpr,
  Expressão,
  ExpressãoEntreParênteses,
  ExpressãoMatemática,
  ExpressãoUnária,
  FaçaEnquantoCmd,
  Função,
  InclusãoBiblioteca,
  IncrementoUnárioPrefixadoExpr,
  IncrementoUnárioPósfixadoExpr,
  InicializaçãoMatrizExpr,
  InicializaçãoVetorExpr,
  InteiroExpr,
  LógicoExpr,
  MaisUnárioExpr,
  MenosUnárioExpr,
  MultiplicaçãoExpr,
  MóduloExpr,
  NegaçãoBitwiseExpr,
  NegaçãoExpr,
  Node,
  OperaçãoAndBitwiseExpr,
  OperaçãoAndLógicoExpr,
  OperaçãoDiferençaExpr,
  OperaçãoIgualdadeExpr,
  OperaçãoMaiorOuIgualQueExpr,
  OperaçãoMaiorQueExpr,
  OperaçãoMenorOuIgualQueExpr,
  OperaçãoMenorQueExpr,
  OperaçãoOrBitwiseExpr,
  OperaçãoOrLógicoExpr,
  OperaçãoShiftLeftExpr,
  OperaçãoShiftRightExpr,
  OperaçãoXorExpr,
  ParaCmd,
  PareCmd,
  Parâmetro,
  RealExpr,
  ReferênciaArrayExpr,
  ReferênciaMatrizExpr,
  ReferênciaVarExpr,
  RetorneCmd,
  SeCmd,
  SenãoCmd,
  SomaExpr,
  SubtraçãoExpr,
  UnhandledNode,
  VazioExpr,
  ÍndiceArrayExpr,
};

export const ContextNodeMapping = {
  [AdicaoContext.constructor.name]: SomaExpr,
  [ArquivoContext.constructor.name]: Arquivo,
  [AtribuicaoCompostaDivisaoContext.constructor.name]: AtribuiçãoCompostaDivisãoCmd,
  [AtribuicaoCompostaMultiplicacaoContext.constructor.name]: AtribuiçãoCompostaMultiplicaçãoCmd,
  [AtribuicaoCompostaSomaContext.constructor.name]: AtribuiçãoCompostaSomaCmd,
  [AtribuicaoCompostaSubtracaoContext.constructor.name]: AtribuiçãoCompostaSubtraçãoCmd,
  [AtribuicaoContext.constructor.name]: AtribuiçãoCmd,
  [CaracterContext.constructor.name]: CaractereExpr,
  [CasoContext.constructor.name]: CasoCmd,
  [ChamadaFuncaoContext.constructor.name]: ChamadaFunçãoExpr,
  [ColunaMatrizContext.constructor.name]: Bypass,
  [ComandoContext.constructor.name]: Bypass,
  [CondicaoContext.constructor.name]: Bypass,
  [DeclaracaoArrayContext.constructor.name]: DeclaraçãoVetorExpr,
  [DeclaracaoContext.constructor.name]: DeclaraçãoCmd,
  [DeclaracaoFuncaoContext.constructor.name]: Função,
  [DeclaracaoMatrizContext.constructor.name]: DeclaraçãoMatrizExpr,
  [DeclaracaoVariavelContext.constructor.name]: DeclaraçãoVariávelExpr,
  [DecrementoUnarioPosfixadoContext.constructor.name]: DecrementoUnárioPósfixadoExpr,
  [DecrementoUnarioPrefixadoContext.constructor.name]: DecrementoUnárioPrefixadoExpr,
  [DivisaoContext.constructor.name]: DivisãoExpr,
  [EnquantoContext.constructor.name]: EnquantoCmd,
  [EscolhaContext.constructor.name]: EscolhaCmd,
  [EscopoBibliotecaContext.constructor.name]: EscopoBibliotecaExpr,
  [ExpressaoEntreParentesesContext.constructor.name]: ExpressãoEntreParênteses,
  [FacaEnquantoContext.constructor.name]: FaçaEnquantoCmd,
  [InclusaoBibliotecaContext.constructor.name]: InclusãoBiblioteca,
  [IncrementoParaContext.constructor.name]: Bypass,
  [IncrementoUnarioPosfixadoContext.constructor.name]: IncrementoUnárioPósfixadoExpr,
  [IncrementoUnarioPrefixadoContext.constructor.name]: IncrementoUnárioPrefixadoExpr,
  [IndiceArrayContext.constructor.name]: ÍndiceArrayExpr,
  [InicializacaoArrayContext.constructor.name]: InicializaçãoVetorExpr,
  [InicializacaoMatrizContext.constructor.name]: InicializaçãoMatrizExpr,
  [InicializacaoParaContext.constructor.name]: Bypass,
  [LinhaMatrizContext.constructor.name]: Bypass,
  [ListaComandosContext.constructor.name]: Bypass,
  [ListaDeclaracoesContext.constructor.name]: Bypass,
  [ListaExpressoesContext.constructor.name]: Bypass,
  [ListaParametrosContext.constructor.name]: Bypass,
  [MaisUnarioContext.constructor.name]: MaisUnárioExpr,
  [MenosUnarioContext.constructor.name]: MenosUnárioExpr,
  [ModuloContext.constructor.name]: MóduloExpr,
  [MultiplicacaoContext.constructor.name]: MultiplicaçãoExpr,
  [NegacaoBitwiseContext.constructor.name]: NegaçãoBitwiseExpr,
  [NegacaoContext.constructor.name]: NegaçãoExpr,
  [NumeroInteiroContext.constructor.name]: InteiroExpr,
  [NumeroRealContext.constructor.name]: RealExpr,
  [OperacaoAndBitwiseContext.constructor.name]: OperaçãoAndBitwiseExpr,
  [OperacaoDiferencaContext.constructor.name]: OperaçãoDiferençaExpr,
  [OperacaoELogicoContext.constructor.name]: OperaçãoAndLógicoExpr,
  [OperacaoIgualdadeContext.constructor.name]: OperaçãoIgualdadeExpr,
  [OperacaoMaiorContext.constructor.name]: OperaçãoMaiorQueExpr,
  [OperacaoMaiorIgualContext.constructor.name]: OperaçãoMaiorOuIgualQueExpr,
  [OperacaoMenorContext.constructor.name]: OperaçãoMenorQueExpr,
  [OperacaoMenorIgualContext.constructor.name]: OperaçãoMenorOuIgualQueExpr,
  [OperacaoOrBitwiseContext.constructor.name]: OperaçãoOrBitwiseExpr,
  [OperacaoOuLogicoContext.constructor.name]: OperaçãoOrLógicoExpr,
  [OperacaoShiftLeftContext.constructor.name]: OperaçãoShiftLeftExpr,
  [OperacaoShiftRightContext.constructor.name]: OperaçãoShiftRightExpr,
  [OperacaoXorContext.constructor.name]: OperaçãoXorExpr,
  [ParaContext.constructor.name]: ParaCmd,
  [ParametroContext.constructor.name]: Parâmetro,
  [ParametroFuncaoContext.constructor.name]: Bypass,
  [PareContext.constructor.name]: PareCmd,
  [ReferenciaArrayContext.constructor.name]: ReferênciaArrayExpr,
  [ReferenciaMatrizContext.constructor.name]: ReferênciaMatrizExpr,
  [ReferenciaParaVariavelContext.constructor.name]: ReferênciaVarExpr,
  [RetorneContext.constructor.name]: RetorneCmd,
  [SeContext.constructor.name]: SeCmd,
  [SenaoContext.constructor.name]: SenãoCmd,
  [StringContext.constructor.name]: CadeiaExpr,
  [SubtracaoContext.constructor.name]: SubtraçãoExpr,
  [TamanhoArrayContext.constructor.name]: Bypass,
  [ValorLogicoContext.constructor.name]: LógicoExpr,
};
