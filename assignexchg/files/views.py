# -*- coding: utf-8 -*-
from flask import current_app as app
from flask import (Blueprint, render_template, request, url_for, redirect)
from hashlib import sha1
from uuid import uuid4
from assignexchg.security.utils import entrophy_string

from .models import File
from flask.ext.login import login_required, current_user
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)

import datetime
import boto
import os.path
import mimetypes
import json
import time
import hmac
import datetime
import base64
import urllib

blueprint = Blueprint("files", __name__, url_prefix='/files', static_folder="../static")

@blueprint.route('/sign_s3/<room_id>', methods=['GET'])
def sign_s3(room_id):
    """Return a signed url for PUT request to amazon s3

        Filenames are obfuscated and stored according on the bucket as:
            /channels/room_id/hashed_file_name.extension
    """
    AWS_ACCESS_KEY = os.environ.get('AWS_KEY')
    AWS_SECRET_KEY = os.environ.get('AWS_SECRET')
    S3_BUCKET = os.environ.get('AWS_BUCKET')
    folder_name = "channels"

    object_name = request.args.get('file_name')
    mime_type = request.args.get('file_type')
    file_name, extension = os.path.splitext(object_name)

    # create obfuscated filename for storage on s3
    entrophied_object_name = entrophy_string(file_name) + extension

    # TODO determine smallest reasonable upload time
    expires = int(time.time()+60*60*60*24)
    amz_headers = "x-amz-acl:public-read"

    string_to_sign = "PUT\n\n%s\n%d\n%s\n/%s/%s/%s/%s" % (mime_type, expires, amz_headers, S3_BUCKET, 'channels', str(room_id), entrophied_object_name)

    signature = base64.encodestring(hmac.new(AWS_SECRET_KEY.encode(), string_to_sign.encode('utf8'), sha1).digest())
    signature = signature.strip()
    signature = urllib.quote_plus(signature.strip())

    # Link to the new file
    url = 'https://%s.s3.amazonaws.com/%s/%s/%s' % (S3_BUCKET,'channels',str(room_id), entrophied_object_name)

    # Add new file to the database (generates socketio message)
    new_file = File(room_id, current_user.id, file_name, extension,url)
    db.session.add(new_file)
    db.session.commit()

    content = json.dumps({'signedUrl': '%s?AWSAccessKeyId=%s&Expires=%s&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature),'url': url,})
    return content
