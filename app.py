from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
import os, random, string
import subprocess as sp
from threading import Thread
from queue import Queue,Empty
import time
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

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)
thread = None


def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)

'''
Função chamada para eventos gerais
'''
@socketio.on('event', namespace='/portugol')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('response',
         {'data': message['data'], 'count': session['receive_count']})

'''
Função chamada quando usuário entra no seu devspace pessoal
'''
@socketio.on('join_devspace', namespace='/portugol')
def join(message):
    join_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('response',
         {'data': 'Você está no espaço reservado de ID: ' + ', '.join(rooms()),
          'count': session['receive_count']})

'''
Função chamada quando usuário envia algo para seu devspace
Aqui ocorrerá o processamento do código em portugol
'''
@socketio.on('my_devspace', namespace='/portugol')
def receive_portugol(message):
    emit('response',
         {'data': "## Início da execução ##"},
         room=message['room'])
    name = os.getcwd() + '/temp/' + ''.join(random.choice(string.ascii_letters+string.octdigits) for _ in range(15)) + ".por"
    with open(name,mode="w+") as f:
        f.write(message['data'])
    comando = "java -Dfile.encoding=UTF-8 -Xms128m -Xmx512m -d64 -jar \"" + os.getcwd() + "/libs/portugol-console.jar" +"\" \""+ name +"\""
    pobj = sp.Popen(comando,stdin=sp.PIPE,stdout=sp.PIPE,shell=True)
    q = Queue()
    t = Thread(target=getabit,args=(pobj.stdout,q))
    t.daemon = True
    t.start()
    while True:
        # Dormir por 1 seg
        time.sleep(1) # Garantia de que os dados são recebidos por inteiro
        #print(str(getdata(q).decode()))
        emit('response', {'data': str(getdata(q).decode())}, room=message['room'])
        if not t.isAlive():
            break
        '''
        Aguardando input
        '''
        emit('awayting', room=message['room'])
        in_dat = input()
        pobj.stdin.write(bytes(in_dat,'utf-8'))
        pobj.stdin.write(b'\n')
        pobj.stdin.flush()
    emit('response',
         {'data': "## Fim da execução ##"},
         room=message['room'])

'''
Funções extras
'''
@socketio.on('ping', namespace='/portugol')
def ping_pong():
    emit('pong')
@socketio.on('connect', namespace='/portugol')
def test_connect():
    global thread
    if thread is None:
        thread = socketio.start_background_task(target=background_thread)
    emit('response', {'data': 'Conectado!', 'count': 0})

if __name__ == '__main__':
    socketio.run(app, debug=True)
