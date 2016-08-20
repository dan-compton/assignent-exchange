from assignexchg.extensions import bcrypt
import base64
import os
import time


def entrophy_string(filename):
    timestamp = base64.urlsafe_b64encode("%d" % int(time.time()))

    return base64.urlsafe_b64encode(bcrypt.generate_password_hash(filename + timestamp))

