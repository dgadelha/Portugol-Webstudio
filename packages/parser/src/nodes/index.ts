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
import { ParserRuleContext } from "antlr4ts";

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

export const ContextNodeMap = new Map<new (...args: any[]) => ParserRuleContext, new (...args: any[]) => Node>([
  [AdicaoContext, SomaExpr],
  [ArquivoContext, Arquivo],
  [AtribuicaoCompostaDivisaoContext, AtribuiçãoCompostaDivisãoCmd],
  [AtribuicaoCompostaMultiplicacaoContext, AtribuiçãoCompostaMultiplicaçãoCmd],
  [AtribuicaoCompostaSomaContext, AtribuiçãoCompostaSomaCmd],
  [AtribuicaoCompostaSubtracaoContext, AtribuiçãoCompostaSubtraçãoCmd],
  [AtribuicaoContext, AtribuiçãoCmd],
  [CaracterContext, CaractereExpr],
  [CasoContext, CasoCmd],
  [ChamadaFuncaoContext, ChamadaFunçãoExpr],
  [ColunaMatrizContext, Bypass],
  [ComandoContext, Bypass],
  [CondicaoContext, Bypass],
  [DeclaracaoArrayContext, DeclaraçãoVetorExpr],
  [DeclaracaoContext, DeclaraçãoCmd],
  [DeclaracaoFuncaoContext, Função],
  [DeclaracaoMatrizContext, DeclaraçãoMatrizExpr],
  [DeclaracaoVariavelContext, DeclaraçãoVariávelExpr],
  [DecrementoUnarioPosfixadoContext, DecrementoUnárioPósfixadoExpr],
  [DecrementoUnarioPrefixadoContext, DecrementoUnárioPrefixadoExpr],
  [DivisaoContext, DivisãoExpr],
  [EnquantoContext, EnquantoCmd],
  [EscolhaContext, EscolhaCmd],
  [EscopoBibliotecaContext, EscopoBibliotecaExpr],
  [ExpressaoEntreParentesesContext, ExpressãoEntreParênteses],
  [FacaEnquantoContext, FaçaEnquantoCmd],
  [InclusaoBibliotecaContext, InclusãoBiblioteca],
  [IncrementoParaContext, Bypass],
  [IncrementoUnarioPosfixadoContext, IncrementoUnárioPósfixadoExpr],
  [IncrementoUnarioPrefixadoContext, IncrementoUnárioPrefixadoExpr],
  [IndiceArrayContext, ÍndiceArrayExpr],
  [InicializacaoArrayContext, InicializaçãoVetorExpr],
  [InicializacaoMatrizContext, InicializaçãoMatrizExpr],
  [InicializacaoParaContext, Bypass],
  [LinhaMatrizContext, Bypass],
  [ListaComandosContext, Bypass],
  [ListaDeclaracoesContext, Bypass],
  [ListaExpressoesContext, Bypass],
  [ListaParametrosContext, Bypass],
  [MaisUnarioContext, MaisUnárioExpr],
  [MenosUnarioContext, MenosUnárioExpr],
  [ModuloContext, MóduloExpr],
  [MultiplicacaoContext, MultiplicaçãoExpr],
  [NegacaoBitwiseContext, NegaçãoBitwiseExpr],
  [NegacaoContext, NegaçãoExpr],
  [NumeroInteiroContext, InteiroExpr],
  [NumeroRealContext, RealExpr],
  [OperacaoAndBitwiseContext, OperaçãoAndBitwiseExpr],
  [OperacaoDiferencaContext, OperaçãoDiferençaExpr],
  [OperacaoELogicoContext, OperaçãoAndLógicoExpr],
  [OperacaoIgualdadeContext, OperaçãoIgualdadeExpr],
  [OperacaoMaiorContext, OperaçãoMaiorQueExpr],
  [OperacaoMaiorIgualContext, OperaçãoMaiorOuIgualQueExpr],
  [OperacaoMenorContext, OperaçãoMenorQueExpr],
  [OperacaoMenorIgualContext, OperaçãoMenorOuIgualQueExpr],
  [OperacaoOrBitwiseContext, OperaçãoOrBitwiseExpr],
  [OperacaoOuLogicoContext, OperaçãoOrLógicoExpr],
  [OperacaoShiftLeftContext, OperaçãoShiftLeftExpr],
  [OperacaoShiftRightContext, OperaçãoShiftRightExpr],
  [OperacaoXorContext, OperaçãoXorExpr],
  [ParaContext, ParaCmd],
  [ParametroContext, Parâmetro],
  [ParametroFuncaoContext, Bypass],
  [PareContext, PareCmd],
  [ReferenciaArrayContext, ReferênciaArrayExpr],
  [ReferenciaMatrizContext, ReferênciaMatrizExpr],
  [ReferenciaParaVariavelContext, ReferênciaVarExpr],
  [RetorneContext, RetorneCmd],
  [SeContext, SeCmd],
  [SenaoContext, SenãoCmd],
  [StringContext, CadeiaExpr],
  [SubtracaoContext, SubtraçãoExpr],
  [TamanhoArrayContext, Bypass],
  [ValorLogicoContext, LógicoExpr],
]);
