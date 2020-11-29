using System;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace portugol_runtime {
    internal static class Program {
        private static readonly string[] reservadas = { "~|^!+RUNTIME+!^|~", "~|^!+START+!^|~", "~|^!+END+!^|~", "~|^!+INPUT+!^|~", "~|^!+LIMPA+!^|~", "~|^!+SETIP+!^|~", "~|^!+DIE+!^|~" };

        private static void Filter(string filePath) {
            var texto = File.ReadAllText(filePath);

            if (reservadas.Any(texto.Contains)) {
                throw new InvalidOperationException("Código em Portugol contêm palavras reservadas do Webstudio");
            }
        }

        private static void Run(string filePath) {
            try {
                Filter(filePath);

                var proc = new Process {
                    StartInfo = new ProcessStartInfo {
                        Arguments = $"-Dfile.encoding=UTF-8 -Xms16m -Xmx64m -jar \"{AppDomain.CurrentDomain.BaseDirectory}javalibs/portugol-console.jar\" -no-wait -webstudio \"{filePath}\"",
                        FileName = "java"
                    }
                };

                proc.Start();

                if (proc.WaitForExit(120000)) {
                    return;
                }

                proc.Kill();
                Console.WriteLine("\nERRO >> Execuções com Portugol estão limitadas a 2 minutos (timeout)");
            } catch (Exception e) {
                Console.WriteLine($"\nERRO >> {e.Message}");
            }
        }

        private static void Main() {
            while (true) {
                var comando = Console.ReadLine();

                if (comando.Contains("~|^!+DIE+!^|~")) {
                    Environment.Exit(0);
                }

                if (!comando.Contains("~|^!+RUNTIME+!^|~")) {
                    continue;
                }

                var filePath = comando.Replace("~|^!+RUNTIME+!^|~", string.Empty);

                Console.WriteLine("~|^!+START+!^|~");
                Run(filePath);
                Console.WriteLine("~|^!+END+!^|~");

                if (File.Exists(filePath)) {
                    File.Delete(filePath);
                }
            }
        }
    }
}
