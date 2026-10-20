programa {
  funcao inicio() {
    inteiro a[2][3], b[3][2], c[2][2]

    para (inteiro i = 0; i < 2; i++) {
      para (inteiro j = 0; j < 3; j++) {
        leia(a[i][j])
      }
    }

    para (inteiro i = 0; i < 3; i++) {
      para (inteiro j = 0; j < 2; j++) {
        leia(b[i][j])
      }
    }

    para (inteiro i = 0; i < 2; i++) {
      para (inteiro j = 0; j < 2; j++) {
        c[i][j] = 0

        para (inteiro k = 0; k < 3; k++) {
          c[i][j] = c[i][j] + a[i][k] * b[k][j]
        }
      }
    }

    para (inteiro i = 0; i < 2; i++) {
      escreva(c[i][0], " ", c[i][1], "\n")
    }
  }
}
