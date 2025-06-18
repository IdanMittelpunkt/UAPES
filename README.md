# User-aware policy Enforcement System

## Author
Idan Mittelpunkt idan.mittelpunkt@gmail.com
## Description
The project is part of a home assignment for architect job candidates of Check Point.

It is an implementation of the Rule Service, using the following tech stack:
| Key | Value |
|-----|-------|
| OS | macOS Monterey |
| IDE | WebStorm CE |
| Programming Language | Javascript (Node.js) |
| Web Application Framework | Express.js |
| Database | MongoDB |
| Database ORM | Mongoose|
| Database Explorer | MongoDB Compass |
| Test Framework | Jest + SuperTest + mongodb-memory-server |
| Security Token | JWT |
| Containerization | SUSE Rancher |
| API Platform | PostMan |

## Rule Service
See the requirement [here](https://docs.google.com/document/d/1c_hFRYm_QR_S3EQ2SiQAIcXLsFjxLfPORTHnhhNYuAs/edit?usp=sharing), and the entire High-Level Design document [here](https://docs.google.com/document/d/10JfDRIME0duuEWi2wjmYiaGFxfqs2BNPK4hxGY0ILko/edit?usp=sharing).

## How to run ?
There are three environment variables you need to provide:
| Variable | Description |
|----------|-------------|
|PORT|node.js process TCP port|
|MONGODB_URI|uri for mongodb|
|JWT_SECRET|jwt secret to validate JWT tokens|

## Running Tests
In order to run the tests, one must set the node option '--experimental-vm-modules'.

E.g.
```
npm test
```


