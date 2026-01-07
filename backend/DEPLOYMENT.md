# TepStore Backend - cPanel Deployment

## Files to Upload

Upload the entire `backend/` folder to your cPanel home directory:
```
/home/your_cpanel_username/backend/
```

## Required Files Structure
```
/home/your_cpanel_username/
└── backend/
    ├── passenger_wsgi.py    ← Entry point for Passenger
    ├── manage.py
    ├── requirements.txt
    ├── config/
    │   ├── settings.py
    │   ├── settings_production.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── store/
    ├── accounts/
    ├── media/
    └── staticfiles/         ← Created after collectstatic
```

## Environment Variables to Set in cPanel

In the Python App settings, add these environment variables:
- DJANGO_SECRET_KEY=your-secret-key
- DB_NAME=cpanel_user_tepstore
- DB_USER=cpanel_user_dbuser
- DB_PASSWORD=your_db_password
- DEBUG=False
