import requests
import json

url = 'http://localhost:5000'

def register():
    r = requests.put(url + '/api/user', data = {
        'username': 'sgly',
        'password': 'test',
        'nickname': 'SgLy'
    })
    return json.loads(r.text)

def login():
    r = requests.get(url + '/api/login', params = {
        'username': 'sgly',
        'password': 'test',
    })
    return json.loads(r.text)

def get_deadline(token):
    r = requests.get(url + '/api/deadline', params = {
        'token': token
    })
    return json.loads(r.text)

def make_deadline(token):
    r = requests.post(url + '/api/deadline', data = {
        'token': token,
        'title': 't',
        'description': 'd',
        'time': '2017-01-01 12:00:00'
    })
    return json.loads(r.text)

def put_deadline(token, id):
    r = requests.put(url + '/api/deadline/%s' % id, data = {
        'token': token
    })
    return json.loads(r.text)

def delete_deadline(token, id):
    r = requests.delete(url + '/api/deadline/%s' % id, data = {
        'token': token
    })
    return json.loads(r.text)

def delete_notice(token, id):
    r = requests.delete(url + '/api/notice/%s' % id, data = {
        'token': token
    })
    return json.loads(r.text)

def get_notice(token):
    r = requests.get(url + '/api/notice', params = {
        'token': token
    })
    return json.loads(r.text)

def make_notice(token):
    r = requests.post(url + '/api/notice', data = {
        'token': token,
        'title': 't',
        'description': 'd'
    })
    return json.loads(r.text)

def get_chat(token):
    r = requests.get(url + '/api/chats', params = {
        'token': token
    })
    return json.loads(r.text)

def make_course(name, semester):
    r = requests.post(url + '/api/course', data = {
        'name': name,
        'semester': semester
    });
    return json.loads(r.text)

def get_course():
    r = requests.get(url + '/api/course', params = {})
    return json.loads(r.text)

def new_chat(token, course_id, content):
    r = requests.post(url + '/api/chat/%s' % course_id, data = {
        'token': token,
        'content': content
    })
    return json.loads(r.text)

def get_chats(token, course_id, last_id = 0):
    r = requests.get(url + '/api/chat/%s' % course_id, params = {
        'token': token,
        'last_message_id': last_id
    })
    return json.loads(r.text)

def reg_course(course_id, user_id):
    r = requests.post(url + '/api/course/%s/user/%s' % (course_id, user_id), data = {})
    return json.loads(r.text)

t = login()['token']
print('token: ', t)

print(make_deadline(t))
ddl = get_deadline(t)
print(ddl)
print(put_deadline(t, ddl['deadlines'][-1]['id']))
print(get_deadline(t))
print(delete_deadline(t, ddl['deadlines'][-1]['id']))
print(get_deadline(t))

print(make_notice(t))
nts = get_notice(t)
print(nts)
print(delete_notice(t, nts['notices'][-1]['id']))
print(get_notice(t))

print(get_chat(t))
quit()

print(make_course('db', '17-18autumn'));
crs = get_course()
print(crs)
print(reg_course(crs['courses'][-1]['id'], '1'))
print(new_chat(t, crs['courses'][-1]['id'], 'test'))
print(get_chats(t, crs['courses'][-1]['id']))
