using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;

namespace portugol_runtime {
    class Program {
        private static void Filter(string filePath) {
            var texto = File.ReadAllText(filePath);
            var reservadas = new List<string>{ "~|^!+RUNTIME+!^|~", "~|^!+START+!^|~", "~|^!+END+!^|~", "~|^!+INPUT+!^|~", "~|^!+LIMPA+!^|~", "~|^!+SETIP+!^|~" };
            if (reservadas.Any(texto.Contains)) {
                throw new InvalidOperationException("Código em Portugol contêm palavras reservadas do Webstudio");
            }
        }

        private static void Run(string filePath) {
            try {
                Filter(filePath);

                var proc = new Process {
                    StartInfo = new ProcessStartInfo {
                        Arguments = $"-Dfile.encoding=UTF-8 -Xms128m -Xmx512m -d64 -jar \"{AppDomain.CurrentDomain.BaseDirectory}javalibs/portugol-console.jar\" \"{filePath}\"",
                        FileName = "java"
                    }
                };

                new Thread(() => {
                    Thread.CurrentThread.IsBackground = true;
                    Thread.Sleep(1000);
                    if (proc.WaitForExit(500000)) return;
                    proc.Kill();
                    Console.WriteLine("\nERRO >> Execuções com Portugol estão limitadas a 5 minutos (timeout)");
                    Thread.CurrentThread.Interrupt();
                }).Start();

                proc.Start();
                proc.WaitForExit();
            } catch (Exception e) {
                Console.WriteLine($"\nERRO >> {e.Message}");
            }
        }

        static void Main(string[] args) {
            while (true) {
                var comando = Console.ReadLine();
                if (!comando.Contains("~|^!+RUNTIME+!^|~")) continue;
                var filePath = comando.Replace("~|^!+RUNTIME+!^|~", "");

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
