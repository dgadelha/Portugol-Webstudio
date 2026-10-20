programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    real a, b, c, delta, x1, x2

    escreva("a: ")
    leia(a)
    escreva("b: ")
    leia(b)
    escreva("c: ")
    leia(c)

    delta = b * b - 4 * a * c

    se (delta < 0) {
      escreva("Raízes reais: ", 0, "\n")
    } senao se (delta == 0) {
      escreva("Raízes reais: ", 1, "\n")
      escreva("x = ", -b / (2 * a), "\n")
    } senao {
      x1 = (-b - mat.raiz(delta, 2.0)) / (2 * a)
      x2 = (-b + mat.raiz(delta, 2.0)) / (2 * a)

      escreva("Raízes reais: ", 2, "\n")

      se (x1 < x2) {
        escreva("x1 = ", x1, "\n")
        escreva("x2 = ", x2, "\n")
      } senao {
        escreva("x1 = ", x2, "\n")
        escreva("x2 = ", x1, "\n")
      }
    }
  }
}
