import os, pexpect, sys, time
def filter(path):
    reserved = ["~|^!+RUNTIME+!^|~", "~|^!+START+!^|~", "~|^!+END+!^|~", "~|^!+INPUT+!^|~"]
    banned_libs = ["Arquivos", "Graficos", "Mouse", "Sons", "Teclado"]
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
            child = pexpect.spawnu(comando)
            child.interact()
        time.sleep(0.1)
        print("~|^!+END+!^|~")
        if(os.path.isfile(path)):
            os.unlink(path)
