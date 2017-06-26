from webstudio.socket import *
def getabit(o,q):
    for c in iter(lambda:o.read(1),b''):
        q.put(c)
    o.close()

def getdata(q):
    r = b''
    while True:
        try:
            c = q.get(False)
        except Empty:
            break
        else:
            r += c
    return r

@socketio.on('my_devspace', namespace='/portugol')
def receive_portugol(message):
    emit('response',
         {'data': "# Início da execução #"},
         room=message['room'])
    name = os.getcwd() + '/webstudio/temp/' + ''.join(random.choice(string.ascii_letters+string.octdigits) for _ in range(15)) + ".por"
    with open(name,mode="w+") as f:
        f.write(message['data'])
        f.close()
    comando = "java -Dfile.encoding=UTF-8 -Xms128m -Xmx512m -d64 -jar \"" + os.getcwd() + "/libs/portugol-console.jar" +"\" \""+ name +"\""

    pobj = sp.Popen(comando,stdin=sp.PIPE,stdout=sp.PIPE,shell=True)
    q = Queue()
    t = Thread(target=getabit,args=(pobj.stdout,q))
    t.daemon = True
    t.start()
    while True:
        time.sleep(0.5) # Garantia de que os dados são recebidos por inteiro
        data = str(getdata(q).decode())
        emit('response', {'data': data.replace("~|^!+INPUT+!^|~", "")}, room=message['room'])
        if not t.isAlive():
            break
        if("~|^!+INPUT+!^|~" in data):
            pobj.stdin.write(bytes("teste", "utf-8"))
            pobj.stdin.write(b'\n')
            pobj.stdin.flush()
    emit('response',
         {'data': "# Fim da execução #"},
         room=message['room'])
    os.remove(name)
