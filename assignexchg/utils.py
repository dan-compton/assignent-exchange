# -*- coding: utf-8 -*-
'''Helper utilities and decorators.'''
from flask import flash
import datetime

from uuid import uuid4
import boto
import os.path
from flask import current_app as app
from werkzeug.utils import secure_filename

def s3_upload(uploaded_file, subfolder):
    if uploaded_file:
        # create filename, prefixed with datetime
        now = datetime.datetime.now()
        filename = subfolder + now.strftime('%y%m%d%h%m%s') + "-" + secure_filename(uploaded_file.filename)
        url = "http://s3-us-west-2.amazonaws.com/"+app.config['AWS_BUCKET']+'/'
        # thumb_filename = now.strftime('%y%m%d%h%m%s') + "-" + secure_filename(uploaded_file.filename)

        # connect to s3
        s3conn = boto.connect_s3(app.config['AWS_KEY'],app.config['AWS_SECRET'])

        # open s3 bucket, create new key/file
        # set the mimetype, content and access control
        b = s3conn.get_bucket(app.config['AWS_BUCKET']) # bucket name defined in .env

        k = b.new_key(b) # create a new key (like a file)
        k.key = filename # set filename
        k.set_metadata("content-type", uploaded_file.mimetype) # identify mime type
        k.set_contents_from_string(uploaded_file.stream.read()) # file contents to be added
        k.set_acl('public-read') # make publicly readable

        return url+filename
    else:
        return ""

def flash_errors(form, category="warning"):
    '''Flash all errors for a form.'''
    for field, errors in form.errors.items():
        for error in errors:
            flash("{0} - {1}"
                    .format(getattr(form, field).label.text, error), category)
