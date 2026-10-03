/*
 * Copyright (C) 2016 - UNIVALI - Universidade do Vale do Itajaí
 *
 * Este arquivo de código fonte é livre para utilização, cópia e/ou modificação
 * desde que este cabeçalho, contendo os direitos autorais e a descrição do programa,
 * seja mantido.
 *
 * Se tiver dificuldade em compreender este exemplo, acesse as vídeoaulas do Portugol
 * Studio para auxiliá-lo:
 *
 * https://www.youtube.com/watch?v=K02TnB3IGnQ&list=PLb9yvNDCid3jQAEbNoPHtPR0SWwmRSM-t
 *
 * Descrição:
 *
 *   Este exemplo é um jogo de programar o caminho de um personagem
 *   escrito em Portugol. O exemplo demonstra como utilizar algumas das bibliotecas
 *   existentes no Portugol. Neste exemplo, também é possível ver algumas técnicas
 *   utilizadas na criação de jogos.
 *
 * Autores:
 *
 *   Adson Marques da Silva Esteves(shinadson@gmail.com)
 *
 * Data: 11/03/2016
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Util --> u
  inclua biblioteca Teclado --> t
  inclua biblioteca Matematica --> m
  inclua biblioteca Mouse --> mo
  inclua biblioteca Arquivos --> a
  inclua biblioteca Texto --> tx
  inclua biblioteca Tipos --> tp
  inclua biblioteca Sons --> sm

  // Constantes de personagem selecionado
  const inteiro BOY = 1
  const inteiro GIRL = 2
  // Constante de número de pixels andados
  const real quantoanda = 1.0

  // Constantes de direção
  const inteiro DIREITA = 1
  const inteiro DESCE = 2
  const inteiro ESQUERDA = 3
  const inteiro SOBE = 4
  const inteiro leste = 3
  const inteiro sul = 1
  const inteiro oeste = 2
  const inteiro norte = 0

  // Constantes de objeto clicado
  const inteiro COMANDO_DIREITA = 1
  const inteiro COMANDO_DESCE = 2
  const inteiro COMANDO_ESQUERDA = 3
  const inteiro COMANDO_SOBE = 4
  const inteiro COMANDO_LOOP = 8
  const inteiro COMANDO_LOOP_inicio = 8
  const inteiro COMANDO_LOOP_fim = 9
  const inteiro BOTAO_PLAY = 5
  const inteiro BOTAO_RESET = 6
  const inteiro BOTAO_EXCLUIR = 7
  const inteiro BOTAO_PARAR = 10
  const inteiro BOTAO_AUMENTAR_LOOP = 11
  const inteiro BOTAO_DIMINUIR_LOOP = 12

  // Constantes de tamanho de objeto
  const real tamtile[2] = {31.0, 31.0}
  const real tam_mat_comandos[2] = {87.5, 51.5}
  const real tam_comandos[2] = {70.0, 41.0}
  const real tam_botoes[2] = {32.0, 38.0}
  const real tam_quadro_programavel[2] = {518.0, 164.0}
  const real tam_setas[2] = {20.0, 15.0}
  const inteiro tam_matriz_quadro[2] = {22, 7}

  // Constantes de posição de objeto
  const real posicao_mapa[2] = {367.0, 0.0}
  const real posicao_mapa_cerca[2] = {403.0, 48.0}
  const real posicao_mapa_char[2] = {367.0, 0.0}
  const real posicao_quadro[2] = {23.0, 387.0}
  const real posicao_comandos[2] = {595.0, 436.0}
  const real posicao_botoes[3] = {420.0, 484.0, 557.0}
  const real posicao_setas[3] = {539.0, 390.0, 436.0}

  const inteiro TAXA_DE_ATUALIZACAO = 60

  // Variáveis de imagem
  inteiro selecao_boy = 0, selecao_girl = 0, img_ajuda = 0, img_fundo = 0
  inteiro img_boy = 0, img_girl = 0, imagem_charf = 0, imagem_chara = 0, imagem_chars = 0, imagem_char = 0, imagem_exemplo = 0, img_venceu = 0
  inteiro img_mapa = 0, img_objects = 0, img_quadros = 0, img_quadros_adjacentes = 0, img_comandos = 0, img_comandos_menor = 0
  inteiro img_botoes = 0, img_setas = 0, img_botao_excluir = 0, img_numeros = 0, img_quadro_pontuacao = 0, img_borda = 0, img_botao_parar = 0, img_mouse = 0, img_carregando = 0, img_pronto = 0, img_continue = 0
  inteiro happy = 0, happy2 = 0, endgame = 0

  // Variáveis que permitem troca de sprite do personagem para permitir animação
  inteiro indice_imagem = 0, indice_imagem_exemplo = 0
  // Limita a troca de imagens
  inteiro imagemporturnos = 1, imagemporturnos_exemplo = 1, frames = 0, tempo_quadro = 0, tempo_restante = 0, tempo_inicio = 0, fps = 0

  // Variáveis de posição de objeto/personagem
  real posicao_objeto_x = 0.0, posicao_objeto_y = 0.0, posicao_isometrica_objeto_x = 0.0, posicao_isometrica_objeto_y = 0.0
  inteiro char_posicao_original_x_matriz = 0, char_posicao_original_y_matriz = 0
  real char_x = 0.0, char_y = 0.0, char_isometrico_x = 0.0, char_isometrico_y = 0.0
  inteiro posicao_matx = 0, posicao_maty = 0

  // Variáveis que permitem movimentação do personagem e do quadro respectivamente
  real incrementovertical = 0.0, incrementohorizontal = 0.0
  real fator_mexer_quadro = 0.0, fator_mexer_matriz_comandos = 0.0

  // Variáveis que contêm a verificação se o tile seguinte está ocupado
  logico lado_ocupado = falso
  // Variáveis que contêm o lado que o personagem está virado
  inteiro direcao = leste
  inteiro direcao_exemplo = leste

  // Variáveis que permitem comandos com loops
  inteiro fator_dentro_loop = 10000 // Define se o comando está dentro de um loop para desenhar risco de loop atrás dele
  // Pilhas que permitem loops retornarem
  inteiro pilha_de_posicao_dos_loops_x[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
  inteiro pilha_de_posicao_dos_loops_y[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
  inteiro pilha_de_posicao_fim_x[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
  inteiro pilha_de_posicao_fim_y[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
  // Pilha que permite verificar o número de vezes que se passou pelo loop
  inteiro pilha_de_numero_de_loops[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
  // Topo das pilhas
  inteiro topo_pilha_de_posicao = 0
  inteiro topo_pilha_de_numero_de_loops = 0

  // Contém a posição atual do comando executado no momento
  inteiro pos_quadro_x = 0, pos_quadro_y = 0

  // Variável que contém se um comando foi pego para evitar cliques em outros objetos enquanto estiver carregando um comando
  logico pegou_comando = falso
  // Variável que sabe se o mouse está em cima de um objeto para mudar o cursor
  logico em_cima_de_um_objeto = falso
  // Variável que contém qual objeto está sendo clicado no momento
  inteiro objeto_clicado = 0

  // Variável que diz quando tem objeto bloqueando ou não para poder andar
  logico pode_andar = falso

  // Variáveis de início do play, parar e quando chega ao fim da fase
  logico comecou_a_rodar = falso
  logico chegou_no_fim = falso
  logico parou = falso

  // Verificam o tempo para realizar o duplo clique
  inteiro click_timing = 0
  logico clicou = falso

  // Contém as posições do mouse
  inteiro posicao_x_mouse = 0, posicao_y_mouse = 0

  // Variáveis que contêm pontuação
  inteiro tempo_inicial = 0
  inteiro pontos_tempo = 0, pontos_instrucoes = 0, pontos_deletados = 0, pontos_limpou = 0, pontos_play = 0, pontos_loops = 0, pontos_loop_dentro = 0
  real pontuacoes[] = {0.0, 0.0, 0.0}
  inteiro pontos_minimos_instrucoes = 0, pontos_loops_minimos = 0, pontos_loop_dentro_minimo = 0

  // Variáveis para leitura de mapas em arquivos
  inteiro digitos_por_tile = 8, digitos_parte = 2
  inteiro NUMERO_LINHAS = 8, NUMERO_COLUNAS = 8
  cadeia nome_arquivo = ""

  // Variável do nível atual
  inteiro nivel = 1
  logico acabou_fases = falso

  // Posições dos diferentes sprites na sprite sheet
  inteiro sprite[4][10] = {
    {32, 80, 62, 80, 91, 80, 123, 80, 154, 80},
    {32, 160, 62, 160, 91, 160, 123, 160, 154, 160},
    {32, 240, 62, 240, 91, 240, 123, 240, 154, 240},
    {32, 320, 62, 320, 91, 320, 123, 320, 154, 320}
  }

  // Mapa de posição dos objetos
  inteiro mapa[8][8] = {
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0}
  }
  // Mapa de posição do personagem
  inteiro mapa_char[8][8] = {
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0}
  }
  // Mapa de posição de cercas horizontais
  inteiro mapa_cerca_horizontal[9][8] = {
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0}
  }
  // Mapa de posição de cercas verticais
  // OBS: foram necessários 2 mapas para cercas, pois as cercas ficam na borda dos tiles e uma matriz horizontal e vertical podem acabar partindo de um mesmo ponto
  inteiro mapa_cerca_vertical[8][9] = {
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0, 0}
  }
  // Mapa dos comandos que são posicionados no quadro
  inteiro mat_pos_quadro_programavel[][] = {
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0}
  }
  // Mapa dos comandos que estão posicionados no quadro exemplo para serem selecionados
  inteiro mat_pos_quadro_comandos[2][2] = {
    {oeste, norte},
    {sul, leste}
  }

  funcao telainicial() {
    iniciar_jogo()
  }

  funcao iniciar_jogo() {
    // Quando inicia um novo jogo/fase
    tempo_inicial = u.tempo_decorrido() // Seta um novo tempo
    limpar_campo() // Limpa mapas
    abrir_novo_nivel() // Abre o nível a entrar
    se (acabou_fases) { // Verifica se terminou todas as fases e manda para a tela final
      tela_venceu()
    }
    definir_posicao_original() // Grava a posição original do personagem para futuras checagens
    posicao_inicial() // Coloca o personagem em sua posição original
    faca {
      jogar()
    } enquanto (nao chegou_no_fim) // Continuará a jogar enquanto o personagem não tiver chegado ao fim da fase
    proxima_fase() // Se chegou ao final, sairá do loop e irá à próxima fase
  }

  funcao conta_fps() {
    frames++
    g.definir_cor(g.COR_PRETO)
    g.desenhar_texto(50, 50, "FPS: " + fps)
    se (pontos_tempo < u.tempo_decorrido() / 1000 - tempo_inicial / 1000) {
      fps = frames
      frames = 0
    }
  }

  funcao iniciar_sincronia_da_taxa_de_atualizacao() {
    tempo_inicio = u.tempo_decorrido() + tempo_restante
  }

  funcao finalizar_sincronia_da_taxa_de_atualizacao() {
    inteiro tempo_decorrido = u.tempo_decorrido() - tempo_inicio
    tempo_restante = tempo_quadro - tempo_decorrido

    enquanto (TAXA_DE_ATUALIZACAO > 0 e tempo_restante > 0) {
      tempo_decorrido = u.tempo_decorrido() - tempo_inicio
      tempo_restante = tempo_quadro - tempo_decorrido
    }
  }

  funcao limpar_campo() {
    // Zera todos os mapas, deixando-os livres para novo mapa
    inteiro i, j
    para (i = 0; i < 8; i++) {
      para (j = 0; j < 8; j++) {
        mapa[i][j] = 0
        mapa_char[i][j] = 0
        mapa_cerca_horizontal[i][j] = 0
        mapa_cerca_vertical[i][j] = 0
      }
      mapa_cerca_vertical[i][j] = 0
    }
    para (j = 0; j < 8; j++) {
      mapa_cerca_horizontal[i][j] = 0
    }
  }

  funcao abrir_novo_nivel() {
    nome_arquivo = "./fases/" + "nivel" + nivel + ".lvl" // Coloca o caminho onde está o arquivo
    cadeia formatos[] = {
      "Arquivos de Level|lvl" // Tipo de arquivo a ser aberto
    }

    carregar_nivel(nome_arquivo) // Abre o arquivo e coloca os mapas novos
  }

  funcao carregar_nivel(cadeia nome_arquivo) {
    se (a.arquivo_existe(nome_arquivo)) {
      inteiro arquivo, linha = 0, coluna = 0
      cadeia texto_linha

      arquivo = a.abrir_arquivo(nome_arquivo, a.MODO_LEITURA) // Abre o arquivo para lê-lo

      enquanto (linha < NUMERO_LINHAS) {
        texto_linha = a.ler_linha(arquivo)
        para (coluna = 0; coluna < NUMERO_COLUNAS; coluna++) {
          cadeia temp = tx.extrair_subtexto(texto_linha, coluna * digitos_por_tile, coluna * digitos_por_tile + digitos_por_tile)

          cadeia tchar = tx.extrair_subtexto(temp, 0, digitos_parte)
          cadeia ttile = tx.extrair_subtexto(temp, digitos_parte, digitos_parte * 2)
          cadeia tcerca_h = tx.extrair_subtexto(temp, digitos_parte * 2, digitos_parte * 3)
          cadeia tcerca_v = tx.extrair_subtexto(temp, digitos_parte * 3, digitos_parte * 4)

          mapa_char[linha][coluna] = tp.cadeia_para_inteiro(tchar, 16) % 10
          mapa[linha][coluna] = tp.cadeia_para_inteiro(ttile, 16) / 10
          direcao_inicial(tp.cadeia_para_inteiro(tchar, 16))
          mapa_cerca_horizontal[linha][coluna] = tp.cadeia_para_inteiro(tcerca_h, 16)
          mapa_cerca_vertical[linha][coluna] = tp.cadeia_para_inteiro(tcerca_v, 16)
        }
        cadeia temp = tx.extrair_subtexto(texto_linha, (coluna) * digitos_por_tile, (coluna) * digitos_por_tile + digitos_por_tile)
        cadeia tcerca_v = tx.extrair_subtexto(temp, digitos_parte * 3, digitos_parte * 4)
        mapa_cerca_vertical[linha][coluna] = tp.cadeia_para_inteiro(tcerca_v, 16)

        linha++
      }
      texto_linha = a.ler_linha(arquivo)
      para (coluna = 0; coluna < NUMERO_COLUNAS; coluna++) {
        cadeia temp = tx.extrair_subtexto(texto_linha, coluna * digitos_por_tile, coluna * digitos_por_tile + digitos_por_tile)
        cadeia tcerca_h = tx.extrair_subtexto(temp, digitos_parte * 3, digitos_parte * 4)
        mapa_cerca_horizontal[linha][coluna] = tp.cadeia_para_inteiro(tcerca_h, 16)
      }
      // No arquivo os tiles estão por 4 Hexadecimais, sendo cada um para um mapa diferente,
      // assim cada função acima quebra o número no arquivo
      // e coloca para cada lugar no seu respectivo mapa
      pontos_minimos_instrucoes = tp.cadeia_para_inteiro(a.ler_linha(arquivo), 16)
      pontos_loops_minimos = tp.cadeia_para_inteiro(a.ler_linha(arquivo), 16)
      pontos_loop_dentro_minimo = tp.cadeia_para_inteiro(a.ler_linha(arquivo), 16)
      a.fechar_arquivo(arquivo)
    } senao {
      acabou_fases = verdadeiro
    }
  }

  funcao direcao_inicial(inteiro d) {
    // Define a direção do personagem com base no que está no arquivo da fase
    d = d / 10
    escolha (d) {
      caso 1: direcao = leste pare
      caso 2: direcao = norte pare
      caso 3: direcao = sul pare
      caso 4: direcao = oeste pare
    }
  }

  funcao jogar() {
    // Começa a jogar
    faca {
      // iniciar_sincronia_da_taxa_de_atualizacao()
      pega_comando() // Função que permite pegar um comando e colocar no quadro
      desenhar() // Função que desenha o que precisa na tela
      acha_mouse() // Atualiza a posição do mouse
      reseta_cursor()
      // finalizar_sincronia_da_taxa_de_atualizacao()
      se (deu_reset()) {
        resetar() // Se o objeto da lixeira for clicado o quadro de comandos é limpo
      }
    } enquanto (nao deu_play()) // Permitirá pegar comandos até que se dê play
    posicao_inicial() // Retorna o personagem à sua posição inicial
    rodar_caminho() // Roda os comandos no quadro
  }

  funcao logico deu_play() {
    // Verifica o clique no botão PLAY
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_botoes[1], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) e pegou_comando == falso) {
      objeto_clicado = BOTAO_PLAY
      retorne falso
    }
    se ((objeto_clicado == BOTAO_PLAY e mouse_esta_sobre_objeto(posicao_botoes[1], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) e objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_botoes[1], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) == falso) {
      // Se clicou e quando desclicou o mouse ainda estava no botão PLAY, retorna verdadeiro, ou seja, clicou verdadeiramente
      objeto_clicado = 0
      pontos_play++
      retorne verdadeiro
    }
    retorne falso
  }

  funcao logico deu_reset() {
    // Verifica o clique no botão RESET
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_botoes[0], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) e pegou_comando == falso) {
      objeto_clicado = BOTAO_RESET
      retorne falso
    }
    se ((objeto_clicado == BOTAO_RESET e mouse_esta_sobre_objeto(posicao_botoes[0], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) e objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_botoes[0], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) == falso) {
      // Se clicou e quando desclicou o mouse ainda estava no botão RESET, retorna verdadeiro, ou seja, clicou verdadeiramente
      pontos_limpou++
      objeto_clicado = 0
      retorne verdadeiro
    }
    retorne falso
  }

  funcao logico deu_parar() {
    // Verifica o clique no botão PARAR
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_botoes[1], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) e pegou_comando == falso) {
      objeto_clicado = BOTAO_PARAR
      retorne falso
    }
    se ((objeto_clicado == BOTAO_PARAR e mouse_esta_sobre_objeto(posicao_botoes[1], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) e objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_botoes[1], posicao_botoes[2], tam_botoes[0], tam_botoes[1])) == falso) {
      // Se clicou e quando desclicou o mouse ainda estava no botão PARAR, retorna verdadeiro, ou seja, clicou verdadeiramente
      objeto_clicado = 0
      retorne verdadeiro
    }
    retorne falso
  }

  funcao pega_comando() {
    // Verifica se um comando foi pego pelo mouse
    se (mouse_esta_sobre_comandos() e nao pegou_comando e nao clicou) {
      objeto_clicado = comando_que_foi_clicado()
      se (objeto_clicado != 0) {
        clicou = verdadeiro
        click_timing = u.tempo_decorrido()
      }
    }
    se (um_comando_esta_selecionado() e (objeto_foi_clicado(pegou_comando) == falso)) {
      se (mouse_esta_sobre_objeto(posicao_quadro[0], posicao_quadro[1], tam_quadro_programavel[0], tam_quadro_programavel[1])) {
        // Se tem um comando e está em cima do quadro, o comando é colocado no quadro
        coloca_comando_no_quadro()
      }
      pegou_comando = falso
      objeto_clicado = 0
    }
    se (mouse_esta_sobre_comandos() e (nao pegou_comando) e clicou e (u.tempo_decorrido() - click_timing < 500)) {
      objeto_clicado = comando_que_foi_clicado()
      se (objeto_clicado != 0) {
        coloca_comando_no_quadro()
        clicou = falso
        click_timing = 1000
      }
    }
    se (u.tempo_decorrido() - click_timing >= 500) {
      clicou = falso
    }
  }

  funcao logico um_comando_esta_selecionado() {
    // Verifica se tem um comando no mouse
    se (objeto_clicado == COMANDO_SOBE) {
      retorne verdadeiro
    }

    se (objeto_clicado == COMANDO_DESCE) {
      retorne verdadeiro
    }

    se (objeto_clicado == COMANDO_DIREITA) {
      retorne verdadeiro
    }

    se (objeto_clicado == COMANDO_ESQUERDA) {
      retorne verdadeiro
    }

    se (objeto_clicado == COMANDO_LOOP) {
      retorne verdadeiro
    }

    retorne falso
  }

  funcao coloca_comando_no_quadro() {
    // Pega o comando e coloca no quadro
    // Dependendo da posição onde é colocado, ele pode receber o fator de estar dentro do loop ou não
    // Se já se tem um comando no local onde é colocado, uma posição é aberta no local para se colocar o novo comando
    // Se é um loop a ser colocado, deve-se alocar 2 posições no quadro para colocar o início e o fim do loop
    inteiro fator_numero_de_loops = 1
    pontos_instrucoes++
    para (inteiro i = 0; i < tam_matriz_quadro[0]; i++) {
      para (inteiro j = 0; j < tam_matriz_quadro[1]; j++) {
        se (mouse_esta_sobre_objeto(j * tam_comandos[0] + posicao_quadro[0], i * tam_comandos[1] + posicao_quadro[1], tam_comandos[0], tam_comandos[1])) {
          se (mat_pos_quadro_programavel[i][j] != 0) {
            abrir_espaco_matriz(i, j)
            se (j + 1 > 6) {
              se (mat_pos_quadro_programavel[i + 1][0] % 10 == COMANDO_LOOP_fim ou mat_pos_quadro_programavel[i + 1][0] > fator_dentro_loop) {
                fator_numero_de_loops = (mat_pos_quadro_programavel[i + 1][0] / fator_dentro_loop)
                se (mat_pos_quadro_programavel[i + 1][0] % 10 == COMANDO_LOOP_fim) {
                  fator_numero_de_loops = (mat_pos_quadro_programavel[i + 1][0] / fator_dentro_loop) + 1
                }
                se (objeto_clicado == COMANDO_LOOP) {
                  abrir_espaco_matriz(i + 1, 0)
                  mat_pos_quadro_programavel[i][j] = COMANDO_LOOP_inicio + (fator_dentro_loop * fator_numero_de_loops)
                  mat_pos_quadro_programavel[i + 1][0] = COMANDO_LOOP_fim + (fator_dentro_loop * fator_numero_de_loops)
                  pontos_loops++
                  pontos_loop_dentro++
                  retorne
                }
                mat_pos_quadro_programavel[i][j] = objeto_clicado + (fator_dentro_loop * fator_numero_de_loops)
                pontos_loop_dentro++
                retorne
              }
              se (objeto_clicado == COMANDO_LOOP) {
                abrir_espaco_matriz(i + 1, 0)
                mat_pos_quadro_programavel[i][j] = COMANDO_LOOP_inicio
                mat_pos_quadro_programavel[i + 1][0] = COMANDO_LOOP_fim
                pontos_loops++
                retorne
              }
              mat_pos_quadro_programavel[i][j] = objeto_clicado
              retorne
            }
            se (mat_pos_quadro_programavel[i][j + 1] % 10 == COMANDO_LOOP_fim ou mat_pos_quadro_programavel[i][j + 1] > fator_dentro_loop) {
              fator_numero_de_loops = (mat_pos_quadro_programavel[i][j + 1] / fator_dentro_loop)
              se (mat_pos_quadro_programavel[i][j + 1] % 10 == COMANDO_LOOP_fim) {
                fator_numero_de_loops = (mat_pos_quadro_programavel[i][j + 1] / fator_dentro_loop) + 1
              }
              se (objeto_clicado == COMANDO_LOOP) {
                abrir_espaco_matriz(i, j + 1)
                mat_pos_quadro_programavel[i][j] = COMANDO_LOOP_inicio + (fator_dentro_loop * fator_numero_de_loops)
                mat_pos_quadro_programavel[i][j + 1] = COMANDO_LOOP_fim + (fator_dentro_loop * fator_numero_de_loops)
                pontos_loops++
                pontos_loop_dentro++
                retorne
              }
              mat_pos_quadro_programavel[i][j] = objeto_clicado + (fator_dentro_loop * fator_numero_de_loops)
              pontos_loop_dentro++
              retorne
            }
            se (objeto_clicado == COMANDO_LOOP) {
              abrir_espaco_matriz(i, j + 1)
              mat_pos_quadro_programavel[i][j] = COMANDO_LOOP_inicio
              mat_pos_quadro_programavel[i][j + 1] = COMANDO_LOOP_fim
              pontos_loops++
              retorne
            }
            mat_pos_quadro_programavel[i][j] = objeto_clicado
            retorne
          }
        }
        se (mat_pos_quadro_programavel[i][j] == 0) {
          se (objeto_clicado == COMANDO_LOOP) {
            se (j + 1 > 6) {
              mat_pos_quadro_programavel[i][j] = COMANDO_LOOP_inicio
              mat_pos_quadro_programavel[i + 1][0] = COMANDO_LOOP_fim
              pontos_loops++
              retorne
            }
            mat_pos_quadro_programavel[i][j] = COMANDO_LOOP_inicio
            mat_pos_quadro_programavel[i][j + 1] = COMANDO_LOOP_fim
            pontos_loops++
            retorne
          }
          mat_pos_quadro_programavel[i][j] = objeto_clicado
          retorne
        }
      }
    }
  }

  funcao abrir_espaco_matriz(inteiro i, inteiro j) {
    // Permite abrir um espaço no quadro de comandos caso já se tenha um comando no local onde será colocado o novo
    para (inteiro k = tam_matriz_quadro[0] - 1; k >= i; k--) {
      para (inteiro l = tam_matriz_quadro[1] - 1; l >= 0; l--) {
        se (k == i e l == j) {
          retorne
        }
        se (l - 1 < 0) {
          mat_pos_quadro_programavel[k][l] = mat_pos_quadro_programavel[k - 1][6]
        } senao {
          mat_pos_quadro_programavel[k][l] = mat_pos_quadro_programavel[k][l - 1]
        }
      }
    }
  }

  funcao rodar_caminho() {
    // Movimenta o personagem de acordo com os comandos no quadro
    posicao_inicial() // Coloca na posição inicial
    comecou_a_rodar = verdadeiro // Define que o personagem está se movimentando
    acha_char() // Atualiza as variáveis com a posição do personagem
    faca {
      reseta_cursor()
      se (nao eh_um_loop()) { // Se o comando atual não for um início ou fim de loop

        roda_char_() // Troca a direção dele
        acha_char() // Atualiza a posição do personagem
        se (verifica_tile()) { // Verifica colisões
          proximo_tile() // A posição do personagem no mapa vai ao próximo tile antes da imagem
          pode_andar = verdadeiro
        } senao {
          pode_andar = falso
        }
        para (inteiro a = 0; a < 31; a++) { // O personagem anda 31 vezes a variável quanto_anda
          se (pode_andar) {
            mover() // Move a imagem do personagem
          }
          se (a == 16) { // Essa condição permite que o char não seja desenhado sobre um objeto antes de chegar no tile próximo
            acha_char() // Atualiza a posição do personagem
          }
          desenhar() // Redesenha a tela
          parou = deu_parar()
          se (parou) {
            pare
          }
        }
      }
      acha_mouse() // Atualiza posição do mouse

      se (parou) {
        pare
      }
    } enquanto (nao terminou_rodar_comandos()) // Continuará a andar enquanto não chegar ao fim do quadro de comandos
    parou = falso
    indice_imagem = 0
    // Se chegou ao fim não precisa mais andar
    comecou_a_rodar = falso
    se (venceu()) { // Verifica se o personagem está no tile final, se sim é pulado para a próxima fase
      proxima_fase()
    }
  }

  funcao acha_mouse() {
    // Atualiza com as posições x e y do mouse
    posicao_x_mouse = mo.posicao_x()
    posicao_y_mouse = mo.posicao_y()
  }

  funcao reseta_cursor() {
    // Permite que a reverificação "se o mouse está sobre objeto" de cada um dos objetos possa mudar o cursor caso seja falso
    em_cima_de_um_objeto = falso
  }

  funcao logico eh_um_loop() {
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == COMANDO_LOOP_inicio) {
      // Se o comando atual é o início de um loop, a posição dele é colocada na pilha
      pilha_de_posicao_dos_loops_x[topo_pilha_de_posicao] = pos_quadro_x
      pilha_de_posicao_dos_loops_y[topo_pilha_de_posicao] = pos_quadro_y
      topo_pilha_de_posicao++
      retorne verdadeiro
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == COMANDO_LOOP_fim) {
      se (pilha_de_posicao_fim_x[topo_pilha_de_numero_de_loops] != pos_quadro_x ou pilha_de_posicao_fim_y[topo_pilha_de_numero_de_loops] != pos_quadro_y) {
        // Se o comando atual é o fim de um loop e for diferente do topo da pilha da posição dos loops finais, então ele é adicionado à pilha dos finais
        topo_pilha_de_numero_de_loops++
        pilha_de_numero_de_loops[topo_pilha_de_numero_de_loops] = (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10000) / 10
        pilha_de_posicao_fim_x[topo_pilha_de_numero_de_loops] = pos_quadro_x
        pilha_de_posicao_fim_y[topo_pilha_de_numero_de_loops] = pos_quadro_y
      }
      se (pilha_de_numero_de_loops[topo_pilha_de_numero_de_loops] == 0) {
        // Se o comando atual é o fim de um loop e o número de vezes para retornar acabou, então as pilhas são diminuídas e retorna para o loop não se repetir
        se (topo_pilha_de_posicao > 0) {
          topo_pilha_de_posicao--
        }
        se (topo_pilha_de_numero_de_loops > 0) {
          topo_pilha_de_numero_de_loops--
        }
        retorne verdadeiro
      }
      // Diminui o número do loop e retorna a posição na pilha de posição de loops
      pilha_de_numero_de_loops[topo_pilha_de_numero_de_loops] -= 1
      pos_quadro_y = pilha_de_posicao_dos_loops_y[topo_pilha_de_posicao - 1]
      pos_quadro_x = pilha_de_posicao_dos_loops_x[topo_pilha_de_posicao - 1]
      retorne verdadeiro
    }
    retorne falso
  }

  funcao logico terminou_rodar_comandos() {
    // Verifica se chegou ao fim dos comandos colocados no quadro
    se (pos_quadro_x == tam_matriz_quadro[1] - 1) {
      // Se chegou ao fim da linha, vai para a próxima
      pos_quadro_y++
      pos_quadro_x = 0
    } senao se (pos_quadro_y == tam_matriz_quadro[0] - 1 e pos_quadro_x == tam_matriz_quadro[1] - 1) {
      // Se chegou à última linha e à última coluna, termina
      retorne verdadeiro
    } senao {
      // Passa para a próxima coluna
      pos_quadro_x++
    }
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] == 0) {
      // Se não tem comandos, termina
      retorne verdadeiro
    }
    retorne falso
  }

  funcao roda_char_() {
    // Direciona o personagem ao lado do comando atual
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == SOBE) {
      incrementohorizontal = 0.0
      incrementovertical = -quantoanda
      direcao = norte
    }
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == DESCE) {
      incrementohorizontal = 0.0
      incrementovertical = quantoanda
      direcao = sul
    }
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == ESQUERDA) {
      incrementohorizontal = -quantoanda
      incrementovertical = 0.0
      direcao = oeste
    }
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == DIREITA) {
      incrementohorizontal = quantoanda
      incrementovertical = 0.0
      direcao = leste
    }
  }

  funcao ajusta_matriz_cercas() {
    // Estende os tiles das cercas para cobrirem o tamanho que precisam
    // as cercas são divididas em 2 e 4 partes
    para (inteiro i = 0; i < 9; i++) {
      para (inteiro j = 0; j < 8; j++) {
        escolha (mapa_cerca_horizontal[i][j]) {
          caso 1: mapa_cerca_horizontal[i][j + 1] = 11 pare

          caso 3: mapa_cerca_horizontal[i][j + 1] = 13
            mapa_cerca_horizontal[i][j + 2] = 23
            mapa_cerca_vertical[i - 1][j + 3] = 33
            mapa_cerca_vertical[i - 2][j + 3] = 43 pare
        }
        escolha (mapa_cerca_vertical[j][i]) {
          caso 4: mapa_cerca_vertical[j + 1][i] = 14 pare

          caso 6: mapa_cerca_vertical[j + 1][i] = 16
            mapa_cerca_vertical[j + 2][i] = 26
            mapa_cerca_horizontal[j + 3][i - 1] = 36
            mapa_cerca_horizontal[j + 3][i - 2] = 46 pare
        }
      }
    }
  }

  funcao desenhar() {
    // Funções de desenho
    iniciar_sincronia_da_taxa_de_atualizacao()
    g.limpar()
    g.definir_cor(0x99FF66)
    g.desenhar_retangulo(0, 0, 800, 600, falso, verdadeiro)
    ajusta_matriz_cercas()
    desenha_mapa()
    mexe_quadro()
    desenha_quadro()
    desenha_comandos()
    desenha_exemplo()
    desenha_botoes()
    desenha_comando_no_mouse()
    conta_fps()
    pontos_tempo = u.tempo_decorrido() / 1000 - tempo_inicial / 1000
    desenha_pontuacao()
    desenha_mouse()
    g.renderizar()
    finalizar_sincronia_da_taxa_de_atualizacao()
  }

  funcao desenha_mouse() {
    acha_mouse()
    se ((posicao_x_mouse > 0 e posicao_y_mouse > 0) e (posicao_x_mouse < 800 e posicao_y_mouse < 600)) {
      se (pegou_comando) {
        g.desenhar_porcao_imagem(posicao_x_mouse, posicao_y_mouse, 50, 0, 22, 28, img_mouse)
      } senao se (em_cima_de_um_objeto) {
        g.desenhar_porcao_imagem(posicao_x_mouse - 11, posicao_y_mouse, 24, 0, 25, 28, img_mouse)
      } senao {
        g.desenhar_porcao_imagem(posicao_x_mouse, posicao_y_mouse, 0, 0, 25, 28, img_mouse)
      }
    }
  }

  funcao desenha_mapa() {
    // Desenha o mapa e seus objetos
    g.desenhar_imagem(154, 88, img_mapa)
    desenha_saida()
    para (inteiro i = 0; i < 8; i++) {
      para (inteiro j = 0; j < 8; j++) { // Passa por todos os mapas para desenhar cada tile necessário
        posicao_objeto(j, i)
        desenha_cerca(mapa_cerca_horizontal[i][j])
        desenha_cerca(mapa_cerca_vertical[i][j])
        desenha_tile(mapa[i][j])
        // debug_mapa(mat_pos_quadro_comandos[i][j])
        // g.renderizar()
        // u.aguarde(100)
        se (posicao_maty == i e posicao_matx == j) {
          desenha_char()
        }
      }
    }

    para (inteiro z = 0; z < 8; z++) {
      posicao_objeto(8, z)
      desenha_cerca(mapa_cerca_vertical[z][8])
      posicao_objeto(z, 8)
      desenha_cerca(mapa_cerca_horizontal[8][z])
    }
  }

  funcao desenha_saida() {
    // A saída precisa ser desenhada antes de tudo, pois, como está presa no chão, todo objeto a sobrepõe
    para (inteiro i = 0; i < 8; i++) {
      para (inteiro j = 0; j < 8; j++) {
        se (mapa[i][j] == 4) {
          posicao_objeto(j, i)
          se (posicao_matx == j e posicao_maty == i) {
            g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa[0], posicao_isometrica_objeto_y + posicao_mapa[1] + 2, 284, 0, 71, 125, img_objects)
          } senao {
            g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa[0], posicao_isometrica_objeto_y + posicao_mapa[1] + 2, 213, 0, 71, 125, img_objects)
          }
        }
      }
    }
  }

  funcao desenha_tile(inteiro s) {
    // Desenha objeto no tile dependendo do número que estiver no mapa
    escolha (s) {
      caso 1: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa[0], posicao_isometrica_objeto_y + posicao_mapa[1], 142, 0, 71, 125, img_objects) pare
      caso 2: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa[0], posicao_isometrica_objeto_y + posicao_mapa[1], 0, 0, 71, 117, img_objects) pare
      caso 3: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa[0], posicao_isometrica_objeto_y + posicao_mapa[1], 71, 0, 71, 125, img_objects) pare
    }
  }

  funcao desenha_cerca(inteiro s) {
    // Desenha a cerca que estiver no tile do mapa de cercas
    escolha (s) {
      // Os números para saber o quanto cortar da cerca e quanto levantá-la foram baseados em tentativa e erro

      caso 1: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1], 6, 128, 32, 78, img_objects) pare
      caso 11: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 17, 35, 128, 32, 78, img_objects) pare
      caso 2: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1], 75, 128, 44, 62, img_objects) pare
      caso 3: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1], 118, 128, 34, 95, img_objects) pare
      caso 13: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 16, 147, 128, 32, 95, img_objects) pare
      caso 23: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 33, 176, 128, 32, 95, img_objects) pare
      caso 33: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 32, 239, 128, -31, 95, img_objects) pare
      caso 43: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 18, 268, 128, -31, 95, img_objects) pare
      caso 4: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1], 269, 223, -32, 78, img_objects) pare
      caso 14: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 17, 237, 223, -32, 78, img_objects) pare
      caso 5: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1], 202, 223, -44, 62, img_objects) pare
      caso 6: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1], 156, 223, -34, 95, img_objects) pare
      caso 16: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 17, 126, 223, -32, 95, img_objects) pare
      caso 26: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 34, 96, 223, -32, 95, img_objects) pare
      caso 36: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 36, 34, 223, 31, 95, img_objects) pare
      caso 46: g.desenhar_porcao_imagem(posicao_isometrica_objeto_x + posicao_mapa_cerca[0], posicao_isometrica_objeto_y + posicao_mapa_cerca[1] - 18, 4, 223, 31, 95, img_objects) pare
    }
  }

  funcao posicao_objeto(inteiro x, inteiro y) {
    // Consegue as posições em 2D e as transforma em posições isométricas para o objeto
    posicao_objeto_x = x * tamtile[0]
    posicao_objeto_y = y * tamtile[1]
    objeto_doisD_para_isometrico()
  }

  funcao desenha_char() {
    // Desenha o char a partir do mapa de posições dos sprites do char declarado no começo, com isso, posições e direção, pode-se trocar as variáveis da posição
    // da imagem do char na folha de sprites de acordo com a direção que estiver o char atualmente
    g.desenhar_porcao_imagem(char_isometrico_x + posicao_mapa_char[0] + 55, char_isometrico_y + posicao_mapa_char[1] + 115, sprite[direcao][indice_imagem * 2], sprite[direcao][indice_imagem * 2 + 1], -32, -80, imagem_chars)
    se (comecou_a_rodar) {
      se (imagemporturnos % 5 == 0) {
        indice_imagem = (indice_imagem + 1) % 5
      }
      imagemporturnos++
    }
  }

  funcao desenha_quadro() {
    se (fator_mexer_quadro > tam_quadro_programavel[1] / 2 - 1.5) {
      fator_mexer_quadro = 0 // Permite que quando chegar no fim da imagem do quadro, retorne ao começo dela
    }
    se (fator_mexer_quadro < 0) {
      fator_mexer_quadro = tam_quadro_programavel[1] / 2 - 1.5 // Permite que quando voltar no começo da imagem do quadro, retorne ao fim dela
    }
    // 36 é a altura da placa "programa"
    g.desenhar_imagem(posicao_quadro[0], posicao_quadro[1] - 36, img_quadros_adjacentes) // Placa programa
    g.desenhar_porcao_imagem(posicao_quadro[0], posicao_quadro[1], 0, fator_mexer_quadro, tam_quadro_programavel[0], tam_quadro_programavel[1] / 2, img_quadros) // Metade do quadro parte de cima
    g.desenhar_porcao_imagem(posicao_quadro[0], posicao_quadro[1] + tam_quadro_programavel[1] / 2, 0, fator_mexer_quadro, tam_quadro_programavel[0], tam_quadro_programavel[1] / 2, img_quadros) // Metade do quadro parte de baixo
    g.desenhar_imagem(posicao_setas[0], posicao_setas[1], img_setas)
    para (inteiro i = 0; i < tam_matriz_quadro[0]; i++) {
      para (inteiro j = 0; j < tam_matriz_quadro[1]; j++) {
        desenha_comando_no_quadro(mat_pos_quadro_programavel[i][j], i, j)
      }
    }
  }

  funcao desenha_comando_no_quadro(inteiro s, inteiro i, inteiro j) {
    // Desenha os comandos do quadro que forem sendo colocados
    real fator_saiu_do_quadro = 0.0
    real fator_saiu_por_cima = 0.0
    // Os cálculos abaixo definem se um comando está dentro ou fora da área do quadro quando ele é movido pelas setas no programa
    // os fatores vão ser usados na hora de imprimir os comandos no quadro, pois eles definirão o quanto será das imagens caso
    // apenas uma parte delas precise ser desenhada
    se ((i * (tam_comandos[1]) + fator_mexer_matriz_comandos) < 0) {
      fator_saiu_do_quadro = (i * (tam_comandos[1]) + fator_mexer_matriz_comandos)
      se (-fator_saiu_do_quadro > tam_comandos[1]) {
        fator_saiu_do_quadro = -tam_comandos[1]
      }
      fator_saiu_por_cima = fator_saiu_do_quadro
    }
    se ((i * (tam_comandos[1]) + fator_mexer_matriz_comandos) > tam_quadro_programavel[1] - tam_comandos[1]) {
      fator_saiu_do_quadro = (tam_quadro_programavel[1] - (i * (tam_comandos[1]) + fator_mexer_matriz_comandos)) - tam_comandos[1]
      se (fator_saiu_do_quadro < -tam_comandos[1]) {
        fator_saiu_do_quadro = -tam_comandos[1]
      }
    }
    // A condição abaixo define se um comando está dentro do loop e desenha um risco atrás dele para dar a impressão de continuidade do loop
    se (s > fator_dentro_loop) {
      g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 1 * tam_comandos[0], 2 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor)
    }
    // A escolha abaixo desenha o comando a partir de sua posição e o quanto está dentro ou fora do quadro
    escolha (s % 10) {
      caso ESQUERDA: g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 0 * tam_comandos[0], 0 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor) pare
      caso DESCE: g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 0 * tam_comandos[0], 1 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor) pare
      caso SOBE: g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 1 * tam_comandos[0], 0 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor) pare
      caso DIREITA: g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 1 * tam_comandos[0], 1 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor) pare
      caso COMANDO_LOOP_inicio: g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 0 * tam_comandos[0], 2 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor) pare
      caso COMANDO_LOOP_fim: g.desenhar_porcao_imagem(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 2 * tam_comandos[0], 2 * tam_comandos[1] - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_comandos_menor) pare
    }
    // Comentário com a função para verificar os números do quadro de comandos
    // debug_quadro_comandos(s, posicao_quadro[0]+(j*tam_comandos[0]), posicao_quadro[1]+(i*(tam_comandos[1])+fator_mexer_matriz_comandos))

    // Verificam se os botões excluir e número de loops foram clicados e modificam o quadro
    se (comecou_a_rodar == falso) {
      verifica_botao_excluir(i, j, fator_saiu_por_cima, fator_saiu_do_quadro)
    }
    verifica_botoes_numero_loop(i, j, fator_saiu_por_cima, fator_saiu_do_quadro)
    // Desenha a borda do comando atual sendo executado
    se (j == pos_quadro_x e i == pos_quadro_y e comecou_a_rodar == verdadeiro) {
      g.desenhar_porcao_imagem(posicao_quadro[0] + (pos_quadro_x * tam_comandos[0]), posicao_quadro[1] + (pos_quadro_y * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 0, 0 - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro, img_borda)
    }
  }

  funcao desenha_comandos() {
    // Desenha a imagem dos comandos que podem ser pegos (são os comandos que ficam com o personagem à direita)
    g.desenhar_imagem(posicao_quadro[0] + tam_quadro_programavel[0] + tam_setas[0], posicao_quadro[1], img_comandos)
  }

  funcao desenha_comando_no_mouse() {
    // Desenha o objeto que foi clicado e está sendo arrastado pelo mouse, no mouse
    acha_mouse()
    se (objeto_clicado == ESQUERDA) {
      g.desenhar_porcao_imagem(posicao_x_mouse - (tam_mat_comandos[0] / 2), posicao_y_mouse - (tam_mat_comandos[1] / 2), 0 * tam_mat_comandos[0] + 35, 0 * tam_mat_comandos[1] + 50, tam_mat_comandos[0], tam_mat_comandos[1], img_comandos)
    }
    se (objeto_clicado == DESCE) {
      g.desenhar_porcao_imagem(posicao_x_mouse - (tam_mat_comandos[0] / 2), posicao_y_mouse - (tam_mat_comandos[1] / 2), 0 * tam_mat_comandos[0] + 35, 1 * tam_mat_comandos[1] + 50, tam_mat_comandos[0], tam_mat_comandos[1], img_comandos)
    }
    se (objeto_clicado == SOBE) {
      g.desenhar_porcao_imagem(posicao_x_mouse - (tam_mat_comandos[0] / 2), posicao_y_mouse - (tam_mat_comandos[1] / 2), 1 * tam_mat_comandos[0] + 35, 0 * tam_mat_comandos[1] + 50, tam_mat_comandos[0], tam_mat_comandos[1], img_comandos)
    }
    se (objeto_clicado == DIREITA) {
      g.desenhar_porcao_imagem(posicao_x_mouse - (tam_mat_comandos[0] / 2), posicao_y_mouse - (tam_mat_comandos[1] / 2), 1 * tam_mat_comandos[0] + 35, 1 * tam_mat_comandos[1] + 50, tam_mat_comandos[0], tam_mat_comandos[1], img_comandos)
    }
    se (objeto_clicado == COMANDO_LOOP) {
      g.desenhar_porcao_imagem(posicao_x_mouse - (tam_mat_comandos[0] / 2), posicao_y_mouse - (tam_mat_comandos[1] / 2), 0 * tam_mat_comandos[0], 2 * tam_mat_comandos[1] + 50, tam_mat_comandos[0] * 3 - 20, tam_mat_comandos[1], img_comandos)
    }
  }

  funcao desenha_exemplo() {
    // Desenha o personagem exemplo, que fica junto ao quadro de comandos à direita
    g.desenhar_porcao_imagem(posicao_comandos[0] + tam_mat_comandos[0] + 20, posicao_comandos[1] + tam_mat_comandos[1] + 10, sprite[direcao_exemplo][indice_imagem_exemplo * 2], sprite[direcao_exemplo][indice_imagem_exemplo * 2 + 1], -32, -80, imagem_exemplo)
    se (mouse_esta_sobre_comandos()) {
      se (imagemporturnos_exemplo % 4 == 0) {
        indice_imagem_exemplo = (indice_imagem_exemplo + 1) % 5
      }
      imagemporturnos_exemplo++
    }
  }

  funcao desenha_botoes() {
    // Desenha os botões play e excluir
    g.desenhar_porcao_imagem(posicao_botoes[0], posicao_botoes[2], 34, 0, tam_botoes[0], tam_botoes[1], img_botoes)
    se (comecou_a_rodar) {
      g.desenhar_imagem(posicao_botoes[1], posicao_botoes[2], img_botao_parar)
    } senao {
      g.desenhar_porcao_imagem(posicao_botoes[1] + 5, posicao_botoes[2], 0, 0, tam_botoes[0], tam_botoes[1], img_botoes)
    }
  }

  funcao desenha_pontuacao() {
    // Desenha as pontuações no topo
    cadeia texto_pontuacao = "Tempo: " + pontos_tempo + " | Instruções: " + pontos_instrucoes + " | Loops: " + pontos_loops + " | Deletados: " + pontos_deletados + " | Limpou: " + pontos_limpou + " | Plays: " + pontos_play + " | Comandos no loop: " + pontos_loop_dentro

    inteiro fator_centralizar = 400
    fator_centralizar -= (tx.numero_caracteres(texto_pontuacao) / 2) * 7.5

    g.desenhar_imagem(0, 0, img_quadro_pontuacao)
    g.definir_cor(g.COR_PRETO)
    g.definir_tamanho_texto(17.0)
    g.desenhar_texto(fator_centralizar, 10, texto_pontuacao)
    g.definir_cor(0x99FF66)
  }

  funcao desenha_numero_loop(inteiro x, inteiro y, inteiro numero, real fator_saiu_do_quadro, real fator_saiu_por_cima) {
    // Descobre o número do loop e o desenha ao lado do próprio

    inteiro numeros[] = {0, 0, 0, 0}, j
    inteiro fator_centralizar = 0, fator_separar = 0

    para (inteiro i = u.numero_elementos(numeros) - 1; i >= 0; i--) {
      // É retirado cada final do número recebido e colocado em um vetor, para cada um ser desenhado separadamente
      numeros[i] = numero % 10
      numero = numero / 10
    }
    para (j = 0; j < u.numero_elementos(numeros); j++) {
      // Necessário para o desenho não começar com zeros na frente, o j terá a posição certa a se começar a desenhar
      se (numeros[j] != 0) {
        pare
      }
    }

    se (j < u.numero_elementos(numeros) e j != 0) {
      fator_centralizar = 10 / j
    }

    para (inteiro g = j; g < u.numero_elementos(numeros); g++) {
      g.desenhar_porcao_imagem(x + fator_separar * 10 - fator_centralizar, y, numeros[g] * 10, 0 - fator_saiu_por_cima, 10, 20 + fator_saiu_do_quadro, img_numeros)
      fator_separar++
    }
  }

  funcao mexe_quadro() {
    // Define quanto os comandos irão se mexer e quanto o quadro também irá.
    // se está no limite do início ou do fim do quadro, ambos não poderão se mover
    se (nao pegou_comando) {
      se (fator_mexer_matriz_comandos < 0) {
        se (esta_clicando_na_seta() == SOBE) {
          fator_mexer_quadro -= 2
          fator_mexer_matriz_comandos += 2
        }
      }
      se ((21 * (tam_comandos[1]) + fator_mexer_matriz_comandos) > tam_quadro_programavel[1] - tam_comandos[1]) {
        se (esta_clicando_na_seta() == DESCE) {
          fator_mexer_quadro += 2
          fator_mexer_matriz_comandos -= 2
        }
      }
    }
  }

  funcao verifica_botoes_numero_loop(inteiro i, inteiro j, real fator_saiu_por_cima, real fator_saiu_do_quadro) {
    // Verifica se o comando do fim do loop foi clicado nos botões + e -, e desenha o for necessário.
    inteiro numero = mat_pos_quadro_programavel[i][j]
    se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_fim) {
      se (mouse_esta_sobre_objeto(posicao_quadro[0] + (j * tam_comandos[0]) + 11, posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima + 13, 16, 16) e nao pegou_comando e comecou_a_rodar == falso) {
        se ((objeto_foi_clicado(verdadeiro) e (mat_pos_quadro_programavel[i][j] % (fator_dentro_loop / 10) > 10))) {
          objeto_clicado = BOTAO_DIMINUIR_LOOP
        }
        se ((objeto_foi_clicado(verdadeiro) == falso e (mat_pos_quadro_programavel[i][j] % (fator_dentro_loop / 10) > 10)) e objeto_clicado == BOTAO_DIMINUIR_LOOP) {
          objeto_clicado = 0
          mat_pos_quadro_programavel[i][j] -= 10
        }
      }

      se (mouse_esta_sobre_objeto(posicao_quadro[0] + (j * tam_comandos[0]) + 46, posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima + 13, 16, 16) e nao pegou_comando e comecou_a_rodar == falso) {
        se (objeto_foi_clicado(verdadeiro)) {
          objeto_clicado = BOTAO_AUMENTAR_LOOP
        }
        se (objeto_foi_clicado(verdadeiro) == falso e objeto_clicado == BOTAO_AUMENTAR_LOOP) {
          objeto_clicado = 0
          mat_pos_quadro_programavel[i][j] += 10
        }
      }

      se (numero > fator_dentro_loop) {
        numero = numero % fator_dentro_loop
      }
      desenha_numero_loop(posicao_quadro[0] + (j * tam_comandos[0]) + 30, posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, numero / 10, fator_saiu_do_quadro, fator_saiu_por_cima)
    }
  }

  funcao verifica_botao_excluir(inteiro i, inteiro j, real fator_saiu_por_cima, real fator_saiu_do_quadro) {
    // Verifica se o x do comando foi clicado e assim tenta excluí-lo do local; se for um loop, ele também levará o começo do loop
    // porém não serão retirados os comandos dentro do loop
    se (mat_pos_quadro_programavel[i][j] != 0) {
      se ((mouse_esta_sobre_objeto(posicao_quadro[0] + (j * tam_comandos[0]), posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, tam_comandos[0], tam_comandos[1] + fator_saiu_do_quadro) e mat_pos_quadro_programavel[i][j] != 0) e pegou_comando == falso) {
        g.desenhar_imagem(posicao_quadro[0] + (j * tam_comandos[0]) + tam_comandos[0] - 17, posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, img_botao_excluir)
        se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_quadro[0] + (j * tam_comandos[0]) + tam_comandos[0] - 17, posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 17.0, 17.0))) {
          objeto_clicado = BOTAO_EXCLUIR
        }
        se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_quadro[0] + (j * tam_comandos[0]) + tam_comandos[0] - 17, posicao_quadro[1] + (i * (tam_comandos[1]) + fator_mexer_matriz_comandos) - fator_saiu_por_cima, 17.0, 17.0)) == falso e objeto_clicado == BOTAO_EXCLUIR) {
          pontos_instrucoes--
          pontos_deletados++
          objeto_clicado = 0
          se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_inicio ou mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_fim) {
            retirar_loop(i, j, mat_pos_quadro_programavel[i][j] % 10)
          } senao {
            retirar_comando(i, j)
          }
        }
      }
    }
  }

  funcao inteiro esta_clicando_na_seta() {
    // Retorna se alguma seta que move o quadro foi clicada
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_setas[0], posicao_setas[1], tam_setas[0], tam_setas[1]))) {
      retorne SOBE
    }
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_setas[0], posicao_setas[2], tam_setas[0], tam_setas[1]))) {
      retorne DESCE
    }
    retorne 0
  }

  funcao logico mouse_esta_sobre_comandos() {
    // Retorna se o mouse está sobre algum dos comandos à direita
    se (mouse_esta_sobre_objeto(posicao_comandos[0], posicao_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1])) {
      direcao_exemplo = oeste
      retorne verdadeiro
    }
    se (mouse_esta_sobre_objeto(posicao_comandos[0] + tam_mat_comandos[0], posicao_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1])) {
      direcao_exemplo = norte
      retorne verdadeiro
    }
    se (mouse_esta_sobre_objeto(posicao_comandos[0], posicao_comandos[1] + tam_mat_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1])) {
      direcao_exemplo = sul
      retorne verdadeiro
    }
    se (mouse_esta_sobre_objeto(posicao_comandos[0] + tam_mat_comandos[0], posicao_comandos[1] + tam_mat_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1])) {
      direcao_exemplo = leste
      retorne verdadeiro
    }
    se (mouse_esta_sobre_objeto(posicao_comandos[0] - 35, posicao_comandos[1] + 2 * tam_mat_comandos[1], tam_mat_comandos[0] * 2, tam_mat_comandos[1])) {
      retorne verdadeiro
    }
    indice_imagem_exemplo = 0
    retorne falso
  }

  funcao inteiro comando_que_foi_clicado() {
    // Verifica se algum comando foi clicado e retorna qual
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_comandos[0], posicao_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1]))) {
      pegou_comando = verdadeiro
      retorne COMANDO_ESQUERDA
    }
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_comandos[0] + tam_mat_comandos[0], posicao_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1]))) {
      pegou_comando = verdadeiro
      retorne COMANDO_SOBE
    }
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_comandos[0], posicao_comandos[1] + tam_mat_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1]))) {
      pegou_comando = verdadeiro
      retorne COMANDO_DESCE
    }
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_comandos[0] + tam_mat_comandos[0], posicao_comandos[1] + tam_mat_comandos[1], tam_mat_comandos[0], tam_mat_comandos[1]))) {
      pegou_comando = verdadeiro
      retorne COMANDO_DIREITA
    }
    se (objeto_foi_clicado(mouse_esta_sobre_objeto(posicao_comandos[0] - 35, posicao_comandos[1] + 2 * tam_mat_comandos[1], tam_mat_comandos[0] * 2, tam_mat_comandos[1]))) {
      pegou_comando = verdadeiro
      retorne COMANDO_LOOP
    }
    retorne 0
  }

  funcao logico mouse_esta_sobre_objeto(real posicao_x_objeto, real posicao_y_objeto, real tamanho_x_objeto, real tamanho_y_objeto) {
    // Função genérica que retorna se o mouse está sobre um objeto, precisa-se saber a posição e o tamanho do objeto
    acha_mouse()
    se (posicao_x_mouse > posicao_x_objeto e posicao_x_mouse < posicao_x_objeto + tamanho_x_objeto) {
      se (posicao_y_mouse > posicao_y_objeto e posicao_y_mouse < posicao_y_objeto + tamanho_y_objeto) {
        em_cima_de_um_objeto = verdadeiro
        retorne verdadeiro
      }
    }
    retorne falso
  }

  funcao logico objeto_foi_clicado(logico esta_no_objeto) {
    // Função genérica que retorna se o objeto foi clicado, precisa-se da confirmação se o mouse está sobre o objeto
    // utilizada normalmente com a função mouse_esta_sobre_objeto()
    se (esta_no_objeto e mo.botao_pressionado(mo.BOTAO_ESQUERDO)) {
      retorne verdadeiro
    }
    retorne falso
  }

  funcao logico verifica_tile() {
    // Verifica o tile
    acha_char()
    retorne verifica_proximo(posicao_maty, posicao_matx)
  }

  funcao logico verifica_proximo(inteiro y, inteiro x) {
    // Verifica se o próximo tile está apto para andar
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == DIREITA) {
      se (x + 1 < 8) {
        se ((mapa[y][x + 1] == 0 ou mapa[y][x + 1] == 4) e mapa_cerca_vertical[y][x + 1] % 10 == 0) {
          retorne verdadeiro
        }
      }
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == ESQUERDA) {
      se (x - 1 > -1) {
        se ((mapa[y][x - 1] == 0 ou mapa[y][x - 1] == 4) e mapa_cerca_vertical[y][x] % 10 == 0) {
          retorne verdadeiro
        }
      }
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == SOBE) {
      se (y - 1 > -1) {
        se ((mapa[y - 1][x] == 0 ou mapa[y - 1][x] == 4) e mapa_cerca_horizontal[y][x] % 10 == 0) {
          retorne verdadeiro
        }
      }
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == DESCE) {
      se (y + 1 < 8) {
        se ((mapa[y + 1][x] == 0 ou mapa[y + 1][x] == 4) e mapa_cerca_horizontal[y + 1][x] % 10 == 0) {
          retorne verdadeiro
        }
      }
    }

    retorne falso
  }

  funcao proximo_tile() {
    // Faz o char andar para o próximo tile
    se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == DIREITA) {
      mapa_char[posicao_maty][posicao_matx + 1] = 1
      mapa_char[posicao_maty][posicao_matx] = 0
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == ESQUERDA) {
      mapa_char[posicao_maty][posicao_matx - 1] = 1
      mapa_char[posicao_maty][posicao_matx] = 0
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == SOBE) {
      mapa_char[posicao_maty - 1][posicao_matx] = 1
      mapa_char[posicao_maty][posicao_matx] = 0
    } senao se (mat_pos_quadro_programavel[pos_quadro_y][pos_quadro_x] % 10 == DESCE) {
      mapa_char[posicao_maty + 1][posicao_matx] = 1
      mapa_char[posicao_maty][posicao_matx] = 0
    }
  }

  funcao objeto_doisD_para_isometrico() {
    // Transforma as posições 2D de um objeto para isométricas
    posicao_isometrica_objeto_x = posicao_objeto_x - posicao_objeto_y
    posicao_isometrica_objeto_y = (posicao_objeto_x + posicao_objeto_y) / 1.75
  }

  funcao char_doisD_para_isometrico() {
    // Transforma as posições do char de 2D para isométricas
    char_isometrico_x = char_x - char_y
    char_isometrico_y = (char_x + char_y) / 1.75
  }

  funcao mover() {
    // Faz o incremento na posição da imagem do char
    char_x += incrementohorizontal
    char_y += incrementovertical
    char_doisD_para_isometrico()
  }

  funcao acha_char() {
    // Encontra a posição do char e a coloca em variáveis
    para (inteiro i = 0; i < 8; i++) {
      para (inteiro j = 0; j < 8; j++) {
        se (mapa_char[i][j] == 1) {
          posicao_maty = i
          posicao_matx = j
        }
      }
    }
  }

  funcao logico venceu() {
    // Verifica se o char chegou ao fim do mapa
    acha_char()
    se (mapa[posicao_maty][posicao_matx] == 4) {
      retorne verdadeiro
    }
    retorne falso
  }

  funcao resetar() {
    // Retorna o char ao início e limpa a matriz de comandos
    posicao_inicial()
    limpar_caminho_matriz()
  }

  funcao retirar_comando(inteiro i, inteiro j) {
    // Função que retira um comando do quadro
    se (mat_pos_quadro_programavel[i][j] > fator_dentro_loop e (mat_pos_quadro_programavel[i][j] % 10 != COMANDO_LOOP_inicio e mat_pos_quadro_programavel[i][j] % 10 != COMANDO_LOOP_fim)) {
      pontos_loop_dentro--
    }
    para (; i < tam_matriz_quadro[0]; i++) {
      para (; j < tam_matriz_quadro[1]; j++) {
        se (j == tam_matriz_quadro[1] - 1) {
          mat_pos_quadro_programavel[i][j] = mat_pos_quadro_programavel[i + 1][0]
        } senao {
          mat_pos_quadro_programavel[i][j] = mat_pos_quadro_programavel[i][j + 1]
        }
        se (mat_pos_quadro_programavel[i][j] == 0) {
          retorne
        }
      }
      j = 0
    }
  }

  funcao retirar_loop(inteiro i, inteiro j, inteiro tipo_a_deletar) {
    // Função que retira um loop do quadro.
    // o início e o final do loop são retirados sem retirar os comandos dentro dele
    inteiro pular_loop_interno = 0
    pontos_loops--
    se (mat_pos_quadro_programavel[i][j] > fator_dentro_loop e mat_pos_quadro_programavel[i][j] - fator_dentro_loop < fator_dentro_loop) {
      pontos_loop_dentro--
    }
    retirar_comando(i, j)
    se (tipo_a_deletar == COMANDO_LOOP_inicio) {
      para (; i < tam_matriz_quadro[0]; i++) {
        para (; j < tam_matriz_quadro[1]; j++) {
          se (mat_pos_quadro_programavel[i][j] > fator_dentro_loop) {
            mat_pos_quadro_programavel[i][j] -= fator_dentro_loop
            se (mat_pos_quadro_programavel[i][j] < fator_dentro_loop e mat_pos_quadro_programavel[i][j] % 10 != COMANDO_LOOP_fim) {
              pontos_loop_dentro--
            }
          }
          se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_inicio) {
            pular_loop_interno++
          } senao se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_fim e pular_loop_interno > 0) {
            pular_loop_interno--
          } senao se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_fim e pular_loop_interno == 0) {
            retirar_comando(i, j)
            retorne
          }
        }
        j = 0
      }
    } senao {
      se (j == 0) {
        j = 6
        i--
      } senao {
        j--
      }
      para (; i >= 0; i--) {
        para (; j >= 0; j--) {
          se (mat_pos_quadro_programavel[i][j] > fator_dentro_loop) {
            mat_pos_quadro_programavel[i][j] -= fator_dentro_loop
            se (mat_pos_quadro_programavel[i][j] < fator_dentro_loop e mat_pos_quadro_programavel[i][j] % 10 != COMANDO_LOOP_inicio) {
              pontos_loop_dentro--
            }
          }
          se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_fim) {
            pular_loop_interno++
          } senao se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_inicio e pular_loop_interno > 0) {
            pular_loop_interno--
          } senao se (mat_pos_quadro_programavel[i][j] % 10 == COMANDO_LOOP_inicio e pular_loop_interno == 0) {
            retirar_comando(i, j)
            retorne
          }
        }
        j = 6
      }
    }
  }

  funcao limpar_caminho_matriz() {
    // Limpa o quadro de comandos
    para (inteiro i = 0; i < u.numero_linhas(mat_pos_quadro_programavel); i++) {
      para (inteiro j = 0; j < u.numero_colunas(mat_pos_quadro_programavel); j++) {
        pontos_instrucoes = 0
        mat_pos_quadro_programavel[i][j] = 0
      }
    }
  }

  funcao posicao_inicial() {
    // Retorna o char para sua posição inicial
    acha_char()

    char_x = char_posicao_original_x_matriz * tamtile[0]
    char_y = char_posicao_original_y_matriz * tamtile[1]

    mapa_char[posicao_maty][posicao_matx] = 0
    mapa_char[char_posicao_original_y_matriz][char_posicao_original_x_matriz] = 1
    acha_char()
    pos_quadro_x = 0
    pos_quadro_y = 0

    char_doisD_para_isometrico()
  }

  funcao definir_posicao_original() {
    // Define a posição inicial do char
    acha_char()
    char_posicao_original_x_matriz = posicao_matx
    char_posicao_original_y_matriz = posicao_maty
  }

  funcao debug_mapa(inteiro s) {
    // Essa função permite desenhar os números que lhe forem enviados
    // ela é chamada no desenho do campo, é normalmente utilizada para verificar se os números nas matrizes estão certos
    g.definir_cor(g.COR_PRETO)
    g.desenhar_texto(posicao_isometrica_objeto_x + posicao_mapa[0], posicao_isometrica_objeto_y + posicao_mapa[1], tp.inteiro_para_cadeia(s, 10))
    g.definir_cor(0x99FF66)
  }

  funcao debug_quadro_comandos(inteiro s, inteiro x, inteiro y) {
    g.definir_cor(g.COR_PRETO)
    g.desenhar_texto(x, y, tp.inteiro_para_cadeia(s, 10))
    g.definir_cor(0x99FF66)
  }

  funcao proxima_fase() {
    // Inicia a próxima fase
    calcula_pontos()
    nivel++
    limpar_caminho_matriz()
    iniciar_jogo()
  }

  funcao calcula_pontos() {
    pontuacoes[nivel - 1] = 1 - ((pontos_instrucoes - pontos_minimos_instrucoes) * 0.01) - (pontos_deletados * 0.01) - (pontos_limpou * 0.01) - (pontos_play * 0.01) - ((pontos_loops - pontos_loops_minimos) * 0.02) - ((pontos_loop_dentro - pontos_loop_dentro_minimo) * 0.02) - (pontos_tempo * 0.0005)
  }

  funcao tela_venceu() {
    real pontuacao_final = 0.0

    para (inteiro i = 0; i < u.numero_elementos(pontuacoes); i++) {
      pontuacao_final += pontuacoes[i]
    }
    pontuacao_final = pontuacao_final / u.numero_elementos(pontuacoes)
    enquanto (objeto_foi_clicado(mouse_esta_sobre_objeto(286, 526, 230, 50)) == falso) {
      g.desenhar_imagem(0, 0, img_fundo)
      g.desenhar_imagem(100, 270, imagem_char)
      g.definir_cor(g.COR_PRETO)
      g.definir_tamanho_texto(24.0)
      g.desenhar_imagem(370, 327, endgame)
      g.desenhar_texto(590, 485, "" + m.arredondar(pontuacao_final * 10, 2))
      g.desenhar_imagem(-80, 0, happy)
      g.desenhar_imagem(400, -11, happy2)
      desenha_mouse()
      g.renderizar()
      reseta_cursor()
    }
  }

  funcao inteiro selecao_de_personagem() {
    // Desenha a tela de seleção de personagem
    // e retorna o personagem selecionado
    inteiro char_selecionado = 0
    cadeia pasta_selecao = "./selecao_personagem/"
    mo.ocultar_cursor()
    img_fundo = g.carregar_imagem(pasta_selecao + "tela_fundo.png")
    img_boy = g.carregar_imagem(pasta_selecao + "personagem_boy.png")
    img_girl = g.carregar_imagem(pasta_selecao + "personagem_girl.png")
    selecao_boy = g.carregar_imagem(pasta_selecao + "personagem_boy_selecao.png")
    selecao_girl = g.carregar_imagem(pasta_selecao + "personagem_girl_selecao.png")
    img_ajuda = g.carregar_imagem(pasta_selecao + "tela_ajuda.png")

    enquanto (char_selecionado == 0) {
      reseta_cursor()
      g.desenhar_imagem(0, 0, img_fundo)
      g.desenhar_imagem(14, 135, img_boy)
      g.desenhar_imagem(487, 150, img_girl)
      se (mouse_esta_sobre_objeto(14.0, 135.0, 395.0, 465.0)) {
        g.desenhar_imagem(14, 135, selecao_boy)
        se (objeto_foi_clicado(verdadeiro)) {
          objeto_clicado = BOY
        }
        se (nao objeto_foi_clicado(verdadeiro) e objeto_clicado == BOY) {
          objeto_clicado = 0
          retorne BOY
        }
      }
      se (mouse_esta_sobre_objeto(487.0, 150.0, 298.0, 465.0)) {
        g.desenhar_imagem(487, 150, selecao_girl)
        se (objeto_foi_clicado(verdadeiro)) {
          objeto_clicado = GIRL
        }
        se (nao objeto_foi_clicado(verdadeiro) e objeto_clicado == GIRL) {
          objeto_clicado = 0
          retorne GIRL
        }
      }
      desenha_mouse()
      g.renderizar()
    }
    retorne 0
  }

  funcao carregar_personagem(inteiro char) {
    // Vai para a tela de tutorial e carrega as imagens do personagem selecionado
    g.limpar()
    g.desenhar_imagem(0, 0, img_ajuda)
    g.desenhar_imagem(286, 526, img_carregando)
    g.renderizar()
    cadeia pasta = "./girl/"
    se (char == 1) {
      pasta = "./boy/"
    }
    imagem_charf = g.carregar_imagem(pasta + "char_f.png")
    imagem_chara = g.carregar_imagem(pasta + "char_a.png")
    imagem_chars = g.carregar_imagem(pasta + "chars.png")
    imagem_char = g.carregar_imagem(pasta + "personagem.png")
    imagem_exemplo = g.carregar_imagem(pasta + "chars.png")

    enquanto (objeto_foi_clicado(mouse_esta_sobre_objeto(286, 526, 230, 50)) == falso) {
      g.limpar()
      g.desenhar_imagem(0, 0, img_ajuda)
      g.desenhar_imagem(286, 526, img_pronto)
      desenha_mouse()
      g.renderizar()
      reseta_cursor()
    }
  }

  funcao carregar_imagens() {
    // Carrega as imagens necessárias
    cadeia pasta_objetos = "./objetos/"
    img_mapa = g.carregar_imagem("./mapa/mapa_vazio.png")
    img_objects = g.carregar_imagem(pasta_objetos + "objects.png")
    img_quadros = g.carregar_imagem(pasta_objetos + "quadro.png")
    img_quadros_adjacentes = g.carregar_imagem(pasta_objetos + "quadros_adjacentes.png")
    img_comandos = g.carregar_imagem(pasta_objetos + "comandos.png")
    img_comandos_menor = g.carregar_imagem(pasta_objetos + "comandos_menor.png")
    img_botoes = g.carregar_imagem(pasta_objetos + "botoes.png")
    img_botao_excluir = g.carregar_imagem(pasta_objetos + "botao_excluir.png")
    img_botao_parar = g.carregar_imagem(pasta_objetos + "botao_parar.png")
    img_setas = g.carregar_imagem(pasta_objetos + "setas.png")
    img_numeros = g.carregar_imagem(pasta_objetos + "numeros.png")
    img_quadro_pontuacao = g.carregar_imagem(pasta_objetos + "quadro_pontuacao.png")
    img_borda = g.carregar_imagem(pasta_objetos + "comando_ativado_borda.png")
    img_mouse = g.carregar_imagem(pasta_objetos + "mouse.png")
    img_carregando = g.carregar_imagem(pasta_objetos + "botao_carregando.png")
    img_pronto = g.carregar_imagem(pasta_objetos + "botao_pronto.png")
    img_continue = g.carregar_imagem(pasta_objetos + "botao_continue.png")
    happy = g.carregar_imagem(pasta_objetos + "happy.gif")
    happy2 = g.carregar_imagem(pasta_objetos + "happy2.gif")
    endgame = g.carregar_imagem(pasta_objetos + "endgame.png")
  }

  funcao inicializar() {
    se (TAXA_DE_ATUALIZACAO > 0) {
      tempo_quadro = 1000 / TAXA_DE_ATUALIZACAO
    }
    // Inicia o modo gráfico
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(800, 600)
    g.definir_titulo_janela("Programe")
  }

  funcao inicio() {
    // Função inicial
    // joga para as funções correspondentes
    inicializar()
    carregar_imagens()
    carregar_personagem(selecao_de_personagem())
    telainicial()
  }
}
