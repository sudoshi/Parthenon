# Superset Configuration File

import os
from flask_appbuilder.security.manager import AUTH_OAUTH

# Database connection string
SQLALCHEMY_DATABASE_URI = 'postgresql://superset:superset_password@localhost:5432/superset'

# Secret key for signing cookies
SECRET_KEY = os.environ.get('SUPERSET_SECRET_KEY', 'thisISaSECRET_1234')

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = True

# Cache configuration
CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_DEFAULT_TIMEOUT': 300,
    'CACHE_KEY_PREFIX': 'superset_',
    'CACHE_REDIS_HOST': 'broadsea-superset-redis',
    'CACHE_REDIS_PORT': 6379,
    'CACHE_REDIS_DB': 1,
    'CACHE_REDIS_URL': 'redis://broadsea-superset-redis:6379/1'
}

# Celery configuration
class CeleryConfig:
    BROKER_URL = 'redis://broadsea-superset-redis:6379/0'
    CELERY_IMPORTS = ('superset.sql_lab', )
    CELERY_RESULT_BACKEND = 'redis://broadsea-superset-redis:6379/0'
    CELERYD_LOG_LEVEL = 'DEBUG'
    CELERYD_PREFETCH_MULTIPLIER = 10
    CELERY_ACKS_LATE = True
    CELERY_ANNOTATIONS = {
        'sql_lab.get_sql_results': {
            'rate_limit': '100/s',
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 120,
            'soft_time_limit': 150,
            'ignore_result': True,
        },
    }
    CELERYBEAT_SCHEDULE = {
        'email_reports.schedule_hourly': {
            'task': 'email_reports.schedule_hourly',
            'schedule': 3600,
        },
    }

CELERY_CONFIG = CeleryConfig

# OMOP CDM Database Connection
SQLALCHEMY_CUSTOM_PASSWORD_STORE = {}
ADDITIONAL_DATABASES = {
    'OMOP CDM': {
        'sqlalchemy_uri': 'postgresql://postgres:postgres@localhost:5432/postgres',
        'description': 'OMOP Common Data Model Database'
    }
}

# OAuth Authentication
AUTH_TYPE = AUTH_OAUTH
OAUTH_PROVIDERS = [
    {
        'name': 'authentik',
        'icon': 'fa-key',
        'token_key': 'access_token',
        'remote_app': {
            'client_id': 'superset',
            'client_secret': 'superset_secret',
            'api_base_url': 'https://{}/authentik/api/v2/'.format(os.environ.get('BROADSEA_HOST')),
            'access_token_url': 'https://{}/authentik/oauth2/token/'.format(os.environ.get('BROADSEA_HOST')),
            'authorize_url': 'https://{}/authentik/oauth2/authorize/'.format(os.environ.get('BROADSEA_HOST')),
            'request_token_url': None,
            'client_kwargs': {
                'scope': 'openid email profile'
            }
        }
    }
]

# Feature flags
FEATURE_FLAGS = {
    'ENABLE_TEMPLATE_PROCESSING': True,
    'DASHBOARD_NATIVE_FILTERS': True,
    'DASHBOARD_CROSS_FILTERS': True,
    'DASHBOARD_NATIVE_FILTERS_SET': True,
    'ALERT_REPORTS': True,
    'EMBEDDED_SUPERSET': True,
    'ENABLE_JAVASCRIPT_CONTROLS': False,
    'VERSIONED_EXPORT': True,
}

# Visualization settings
VIZ_TYPE_BLACKLIST = []
ENABLE_JAVASCRIPT_CONTROLS = False

# Email settings
SMTP_HOST = ''
SMTP_PORT = 25
SMTP_STARTTLS = True
SMTP_SSL = False
SMTP_USER = ''
SMTP_PASSWORD = ''
SMTP_MAIL_FROM = 'superset@example.com'

# Logging
LOG_FORMAT = '%(asctime)s:%(levelname)s:%(name)s:%(message)s'
LOG_LEVEL = 'INFO'
