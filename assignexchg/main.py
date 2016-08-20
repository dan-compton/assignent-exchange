from assignexchg import create_app, socketio
from assignexchg.settings import ProdConfig, DevConfig

app = create_app(config_object=ProdConfig)

if __name__ == '__main__':
    try:
        db.create_all()
    except:
        print "database already exists"
    socketio.run(app)


