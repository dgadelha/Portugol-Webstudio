programa {
  funcao inicio() {
    inteiro a, b, c

    leia(a)
    leia(b)
    leia(c)

    se (a <= 0 ou b <= 0 ou c <= 0 ou a >= b + c ou b >= a + c ou c >= a + b) {
      escreva("não forma um triângulo\n")
    } senao se (a == b e b == c) {
      escreva("equilátero\n")
    } senao se (a == b ou a == c ou b == c) {
      escreva("isósceles\n")
    } senao {
      escreva("escaleno\n")
    }
  }
}
