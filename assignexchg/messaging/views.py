# -*- coding: utf-8 -*-
from flask import (Blueprint, render_template, request, url_for, redirect)
from flask.ext.login import login_required, current_user

from assignexchg.user.models import User
from assignexchg.messaging.models import Message, Room
from flask.ext.socketio import SocketIO
from assignexchg.database import db
from sqlalchemy import or_


import datetime
import json


blueprint = Blueprint("message", __name__, url_prefix='/messages',
                        static_folder="../static")



from keen.client import KeenClient

client = KeenClient(
    project_id="55d57caad2eaaa680084e4f1",
    write_key="5a1ba8ed48c96330714c763b4189bb473db2bdfc3b0116bd676c7c463daa5bd7866b06161dfffd3c6941f7fed62a75662846e0b5d34a45a1b2885d6efe137a3efe1242dc8a85c19de734d1fd9239dbeecef057e94cd2973110b5fc3019a6f29fbea1c450b869aa1d788e9aa454fcb9b3",
    read_key="c1b2dbae1d19172997ba7b83026ae6624a68ff61f682e36770c59e7937d7dd5fb1d1c134fad54681820ab1bcce30b34f541821d05f2423bde8838f850610d5132e0949799d78ea5cfaafaafb98ea8494d03541797fa207047cc784b481a83daac6b2597fdc64ecdee42d1e0233d847af",
    master_key="77D99BDF9E9F295ECF2AFD56BB7027DE"
)


@blueprint.route("/like/<message_id>", methods=["GET", "POST"])
@login_required
def like(message_id):

    # Do payment stuff
    message = Message.query.filter_by(id=message_id).first()
    if message is not None:

        room = Room.query.filter_by(id=message.room_id).first()
        message.likes.append(current_user)

        current_user.likes.append(message)
        db.session.commit()
        user = message.users

        # Send events to Keen.io
        m = {'room_id':room.id, 'room_name':room.title, 'message_owner_username':user.username, 'message_owner_id':user.id, 'message_id':message.id, 'liked_by_name':current_user.username, 'liked_by_id':current_user.id, 'keen':{'timestamp':str(datetime.datetime.utcnow())}}
        client.add_event("heart", m)


        return json.dumps({'result': 'success'})
    return json.dumps({'result':'failure'})

@blueprint.route("/unlike/<message_id>", methods=["GET", "POST"])
@login_required
def unlike(message_id):
    # Do payment stuff
    message = Message.query.filter_by(id=message_id).first()
    if message is not None:
        message.likes.remove(current_user)
        db.session.commit()

        return json.dumps({'result': 'success'})

    return json.dumps({'result':'failure'})

