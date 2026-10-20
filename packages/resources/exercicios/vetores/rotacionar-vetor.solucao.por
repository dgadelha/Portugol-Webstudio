programa {
  funcao inicio() {
    inteiro n, k, numeros[100], rotacionado[100]

    leia(n)

    para (inteiro i = 0; i < n; i++) {
      leia(numeros[i])
    }

    leia(k)

    para (inteiro i = 0; i < n; i++) {
      rotacionado[(i + k) % n] = numeros[i]
    }

    para (inteiro i = 0; i < n; i++) {
      escreva(rotacionado[i], "\n")
    }
  }
}
