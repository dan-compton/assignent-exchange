import json, datetime
from flask import session
from flask.ext.login import login_required, current_user
from flask.ext.socketio import emit, join_room, leave_room
from .. import socketio
from .models import File

from assignexchg.database import (
    Column,
    db,
    Model,
    event
    )

def after_insert_listener(mapper, connection, _file):
    # Use socketio to emit message to JSX component
    # letting it know to update (call to restful API /api/files)
    print 'New File ' + str(_file.id) + ' ' + str(_file.room_id)
    socketio.emit('file', {'file_id':str(_file.id)}, room=str(_file.room_id))

event.listen(File, 'after_insert', after_insert_listener)
