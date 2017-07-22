import os, pexpect, sys, time, signal, errno
from functools import wraps
class TimeoutError(Exception):
    pass
def timeout(seconds=10):
    def decorator(func):
        def _handle_timeout(signum, frame):
            raise TimeoutError()
        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, _handle_timeout)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result

        return wraps(func)(wrapper)

    return decorator

@timeout(300)
def timed_shell(comando):
    if os.name == "nt":
        child = popen_spawn.PopenSpawn(comando)
    else:
        child = pexpect.spawnu(comando)
    child.interact()

def filter(path):
    reserved = ["~|^!+RUNTIME+!^|~", "~|^!+START+!^|~", "~|^!+END+!^|~", "~|^!+INPUT+!^|~"]
    banned_libs = ["Arquivos", "Graficos", "Mouse", "Sons", "Teclado"]
    for x in banned_libs: x = "inclua biblioteca " + x + " -->"
    with open(path, 'r') as content_file: content = str(content_file.read()).rsplit()
    if any(rsr in x for rsr in reserved for x in content):
        raise Exception("Existem palavras reservadas do webstudio no seu código! Palavras reservadas se assemelham à ~|^!+PALAVRA+!^|~")
    elif any(rsr in x for rsr in banned_libs for x in content):
        raise Exception("Existem bibliotecas não permitidas do webstudio no seu código! Se deseja utilizar todas as bibliotecas instale o Portugol Studio.")
while(True):
    command = str(input())
    if("~|^!+RUNTIME+!^|~" in command):
        time.sleep(0.1) # Sleep para pty.js não juntar as linhas
        print("~|^!+START+!^|~")
        path = os.getcwd() + "/" + command.replace("~|^!+RUNTIME+!^|~", "")
        try:
            time.sleep(0.1) # Sleep para pty.js não juntar as linhas
            filter(path)
        except Exception as e:
            print("ERRO!", e)
        else:
            comando = "java -Dfile.encoding=UTF-8 -Xms128m -Xmx512m -d64 -jar \"" + os.getcwd() + "/libs/portugol-console.jar" +"\" \""+ path +"\""
            try:
                timed_shell(comando)
            except TimeoutError:
                print("\nERRO! Você demorou demais para responder (timeout)")
                time.sleep(0.1)
                print("\n")
        time.sleep(0.1)
        print("\n")
        print("~|^!+END+!^|~")
        if(os.path.isfile(path)):
            os.unlink(path)
