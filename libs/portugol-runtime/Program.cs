using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;


namespace portugol_runtime
{
    class Program
    {
        private static bool Filter(string filepath)
        {
            var texto = File.ReadAllText(filepath);
            var reservadas = new List<string>{ "~|^!+RUNTIME+!^|~", "~|^!+START+!^|~", "~|^!+END+!^|~", "~|^!+INPUT+!^|~", "~|^!+LIMPA+!^|~", "~|^!+SETIP+!^|~" };
            if (reservadas.Any(texto.Contains))
            {
                throw new InvalidOperationException("Código em Portugol contêm palavras reservadas do Webstudio");
            }
            return true;
        }
        private static void Portugolrun(string filepath)
        {
            try
            {
                var caminho = "-Dfile.encoding=UTF-8 -Xms128m -Xmx512m -d64 -jar " + "\"" +
                              AppDomain.CurrentDomain.BaseDirectory + "javalibs\\portugol-console.jar" + "\" " + "\"" +
                              filepath + "\"";
                if (!Filter(filepath)) return;
                Console.WriteLine("Iniciando Portugol...");
                var proc = new Process();
                var startInfo = new ProcessStartInfo
                {
                    Arguments = caminho,
                    FileName = "java"
                };

                proc.StartInfo = startInfo;
                new Thread(() =>
                {
                    Thread.CurrentThread.IsBackground = true;
                    Thread.Sleep(1000);
                    if (proc.WaitForExit(500000)) return;
                    proc.Kill();
                    Console.WriteLine("\nERRO >> Execuções com Portugol estão limitadas a 5 minutos (timeout)");
                    Thread.CurrentThread.Interrupt();
                }).Start();
                proc.Start();
                proc.WaitForExit();
            }
            catch (Exception e)
            {
                Console.WriteLine("\nERRO >> {0}", e);
            }
        }
        static void Main(string[] args)
        {
            Console.WriteLine("Iniciando Portugol Runtime...");
            while (true)
            {
                var comando = Console.ReadLine();
                if (!comando.Contains("~|^!+RUNTIME+!^|~")) continue;
                Console.WriteLine("~|^!+START+!^|~");
                Portugolrun(comando.Replace("~|^!+RUNTIME+!^|~", ""));
                Console.WriteLine("~|^!+END+!^|~");
                if (File.Exists(comando.Replace("~|^!+RUNTIME+!^|~", "")))
                {
                    File.Delete(comando.Replace("~|^!+RUNTIME+!^|~", ""));
                }
            }
        }
    }
}
