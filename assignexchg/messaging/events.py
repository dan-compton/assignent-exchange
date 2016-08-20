import json, datetime
from flask import session
from flask.ext.login import login_required, current_user
from flask.ext.socketio import emit, join_room, leave_room
from .models import Message, Room
from .. import socketio
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)

from keen.client import KeenClient

client = KeenClient(
    project_id="55d57caad2eaaa680084e4f1",
    write_key="5a1ba8ed48c96330714c763b4189bb473db2bdfc3b0116bd676c7c463daa5bd7866b06161dfffd3c6941f7fed62a75662846e0b5d34a45a1b2885d6efe137a3efe1242dc8a85c19de734d1fd9239dbeecef057e94cd2973110b5fc3019a6f29fbea1c450b869aa1d788e9aa454fcb9b3",
    read_key="c1b2dbae1d19172997ba7b83026ae6624a68ff61f682e36770c59e7937d7dd5fb1d1c134fad54681820ab1bcce30b34f541821d05f2423bde8838f850610d5132e0949799d78ea5cfaafaafb98ea8494d03541797fa207047cc784b481a83daac6b2597fdc64ecdee42d1e0233d847af",
    master_key="77D99BDF9E9F295ECF2AFD56BB7027DE"
)



@socketio.on('joined')
def joined(message):
    """
    Sent by clients when they enter a room.
    A status message is broadcast to all people in the room.
    """
    # Send events to Keen.io
    room_id = int(message['room'])
    room = Room.query.filter_by(id=room_id).first()
    m = {'room_id':room.id, 'room_name':room.title, 'user_name':current_user.username, 'user_id':current_user.id, 'keen':  {'timestamp':str(datetime.datetime.utcnow())}}
    client.add_event("join_room", m)

    join_room(message['room'])


@socketio.on('message')
def text(message):
    """
    Sent by a client when the user entered a new message.
    The message is sent to all people in the room.
    """

    client.add_event("messages", message)

    new_message = Message(int(message['room']), str(message['body']), datetime.datetime.utcnow())

    if len(message['body']) == 0:
        return

    current_user.messages.append(new_message)
    db.session.add(new_message)
    db.session.commit()

    room_id = int(message['room'])
    room = Room.query.filter_by(id=room_id).first()

    # Send events to Keen.io
    try:
        m = {'room_id':room.id, 'room_name':room.title, 'body':new_message.body, 'created': str(new_message.created), 'user_name':current_user.username, 'user_id':current_user.id, 'keen': {'timestamp':str(new_message.created)}}
        client.add_event("messages", m)
    except:
        print "could not commit message"

    emit('message', {'message_id': str(new_message.id)}, room=message['room'])


@socketio.on('left')
def left(message):
    """
    Sent by clients when they leave a room.
    A status message is broadcast to all people in the room.
    """

    # Send events to Keen.io
    room_id = int(message['room'])
    room = Room.query.filter_by(id=room_id).first()
    m = {'room_id':room.id, 'room_name':room.title, 'user_name':current_user.username, 'user_id':current_user.id, 'keen':  {'timestamp':str(datetime.datetime.utcnow())}}
    client.add_event("left_room", m)



    leave_room(message['room'])
