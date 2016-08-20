# -*- coding: utf-8 -*-
import os

class Config(object):

    SECRET_KEY = os.environ.get('AX_SECRET')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')
    # S3 Settings
    AWS_SECRET = os.environ.get('AWS_SECRET')
    AWS_KEY = os.environ.get('AWS_KEY')
    AWS_URL = os.environ.get('AWS_URL')
    AWS_BUCKET = os.environ.get('AWS_BUCKET')
    S3_UPLOAD_DIRECTORY = ''

    # Stripe Configuration
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')

    # Mail Configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = os.environ.get('MAIL_PORT')
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')

    #Project Settings
    APP_DIR = os.path.abspath(unicode(os.path.dirname(__file__)))  # This directory
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    APP_STATIC = os.path.join(APP_DIR, 'static')
    BCRYPT_LOG_ROUNDS = 13
    ASSETS_DEBUG = False
    DEBUG_TB_ENABLED = False  # Disable Debug toolbar
    DEBUG_TB_INTERCEPT_REDIRECTS = False
    CACHE_TYPE = 'simple'  # Can be "memcached", "redis", etc.
    MEDIA_ROOT = 'media'
    STATIC_ROOT = 'static'


class ProdConfig(Config):
    """Production configuration."""
    ENV = 'prod'
    DEBUG = False
    SSLIFY = False
    DEBUG_TB_ENABLED = False  # Disable Debug toolbar
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

class DevConfig(Config):
    """Development configuration."""
    ENV = 'dev'
    SSLIFY = False
    DEBUG = False
    DEBUG_TB_ENABLED = False  # Disable Debug toolbar
    DB_NAME = 'dev.db'

    # Put the db file in project root
    DB_PATH = os.path.join(Config.PROJECT_ROOT, DB_NAME)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///{0}'.format(DB_PATH)
    DEBUG_TB_ENABLED = True
    ASSETS_DEBUG = True  # Don't bundle/minify static assets
    CACHE_TYPE = 'simple'  # Can be "memcached", "redis", etc.

class TestConfig(Config):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    BCRYPT_LOG_ROUNDS = 1  # For faster tests
    WTF_CSRF_ENABLED = False  # Allows form testing
