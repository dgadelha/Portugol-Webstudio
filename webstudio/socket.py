from webstudio import *
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
from webstudio.compiler import *
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
