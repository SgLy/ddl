`GET /api/login`

Use username and password to login, return token

`{ username, password }`

`{ status, reason, token }`

---

`GET /api/deadline`

Get list of all deadlines, as well as details

`{ token }`

`{ status, reason, [ id, title, description, time, done, course_name ] }`

---

`POST /api/deadline`

Make a new deadline only for current user

`{ token, title, description, time }`

`{ status, reason, id }`

---

`PUT /api/deadline/id`

Mark a deadline as done

`{ token }`

`{ status, reason }`

---

`GET /api/notice`

Get list of all notices as well as detail

`{ token }`

`{ status, reason, [ id, title, description, course_id? ] }`

---

`POST /api/notice`

Make a new notice only for this user

`{ token, title, description }`

`{ status, reason, id }`

---

`GET /api/chats`

Get a list of all chats (courses)

`{ token }`

`{ status, reason, [ id, title, last_username, last_message ] }`

---

`GET /api/chat/id`

Start WebSocket current of a chat

`EMIT post` Post a new message

`ON get` Trigger by server on new incoming messages

`{ token, id }`

---

`GET /api/user`

Get informations of current user

`{ token }`

`{ status, reason, nickname }`

---

`POST /api/user`

Update information for current user

`{ token, password, nickname }`

`{ status, reason }`

---

`PUT /api/user`

New a user (aka. register)

`{ username, password, nickname }`

`{ status, reason, id }`
