---
title: Flask
intro: A concise cheatsheet for Flask, a lightweight WSGI web application framework for Python.
tags:
  - web
  - python
  - backend
---

## Getting Started

### Install Flask

```bash
pip install flask
```

### Hello World

```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, World!"

app.run(debug=True)
```

### Flask CLI

```bash
export FLASK_APP=app.py
flask run
```

## App Config & Environment

### App Object

```python
from flask import Flask
app = Flask(__name__)
```

### Configuration

```python
app.config["DEBUG"] = True
app.config.from_pyfile("config.py")
```

### Common Config Keys

| Key | Description |
| | -- |
| `DEBUG` | Enable debug mode |
| `SECRET_KEY` | For sessions/cookies |
| `ENV` | Set to 'development' |

## Routing & Methods

### Basic Route

```python
@app.route("/")
def home():
    return "Home"
```

### Methods

```python
@app.route("/login", methods=["GET", "POST"])
def login():
    return "Login"
```

### Dynamic Routes

```python
@app.route("/user/<name>")
def user(name):
    return f"User: {name}"
```

## Request & Response

### Request Object

```python
from flask import request

@app.route("/data", methods=["POST"])
def data():
    return request.json
```

### Request Attributes

- `request.args`: Query params
- `request.form`: Form data
- `request.json`: JSON body

### Custom Response

```python
from flask import make_response

@app.route("/custom")
def custom():
    res = make_response("Custom", 200)
    res.headers["X-Test"] = "True"
    return res
```

## Templates & Static

### Render Template

```python
from flask import render_template

@app.route("/")
def page():
    return render_template("index.html", name="Flask")
```

### Jinja Syntax

```html
<h1>Hello {{ name }}</h1>
{% if name %}
<p>Hi!</p>
{% endif %}
```

### Static Files

```html
<link href="{{ url_for('static', filename='style.css') }}" />
```

## Sessions & Cookies

### Using Sessions

```python
from flask import session
app.secret_key = "secret"

@app.route("/login")
def login():
    session["user"] = "admin"
    return "Logged in"
```

### Access Cookies

```python
from flask import request, make_response

@app.route("/cookie")
def cookie():
    resp = make_response("Set cookie")
    resp.set_cookie("site", "Flask")
    return resp
```

## JSON API & Middleware

### JSON Response

```python
from flask import jsonify

@app.route("/api")
def api():
    return jsonify(message="Hello")
```

### Middleware

```python
@app.before_request
def before():
    print("Before")

@app.after_request
def after(res):
    print("After")
    return res
```

## Error Handling & Blueprints

### Error Handling

```python
@app.errorhandler(404)
def not_found(e):
    return "Page not found", 404
```

### Blueprint

```python
from flask import Blueprint

admin = Blueprint("admin", __name__, url_prefix="/admin")

@admin.route("/")
def dash():
    return "Admin"

app.register_blueprint(admin)
```

## Project Structure

### File Structure

```bash
project/
├── app.py
├── templates/
│   └── index.html
├── static/
│   └── style.css
└── config.py
```

### Run Server

```bash
python app.py
# or using CLI
export FLASK_APP=app.py
flask run
```
