import json, datetime
from flask import session
from flask.ext.login import login_required, current_user
from flask.ext.socketio import emit, join_room, leave_room
from .. import socketio
from .models import Assignment

from assignexchg.database import (
    Column,
    db,
    Model,
    event
    )

def after_insert_listener(mapper, connection, assignment):
    print 'New Assignment ' + str(assignment.id)

    # Use socketio to emit message to JSX component
    # letting it know to update (call to restful API /api/assignments)
    socketio.emit('assignment', {'assignment_id':str(assignment.id)}, room=str(assignment.subject_id))

event.listen(Assignment, 'after_insert', after_insert_listener)
