import flask
from flask import Flask
from flask import make_response,render_template,request
from flask import redirect,url_for
from datetime import timedelta
import logging.handlers

from flask_sqlalchemy import SQLAlchemy
import json
import re
import base64

app=Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=2)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://./database.db'
db = SQLAlchemy(app)

class Computer(db.Model):
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    IP=db.Column(db.String(15))
    MAC=db.Column(db.String(17))
    nickname=db.Column(db.String(20))
    sshport=db.Column(db.Integer)
    gpunum=db.Column(db.Integer)

    def __init__(self,IP,MAC,sshport,gpunum,nickname):
        self.IP=IP
        self.MAC=MAC
        self.nickname=nickname
        self.sshport=sshport
        self.gpunum=gpunum

    def __repr__(self):
        return "<Computer %s:%d>"%(self.IP,self.sshport)

class GPU(db.Model):
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    computerid=db.Column(db.Integer, db.ForeignKey('computer.id'))
    gpuindex=db.Column(db.Integer)
    user=db.Column(db.String(6))
    version=db.Column(db.String(20))

    def __init__(self,computerid,gpuindex,user,version):
        self.computerid=computerid
        self.gpuindex=gpuindex
        self.user=user
        self.version=version

    def __repr__(self):
        return "<GPU %d-%s@PC%d by %s>"%(self.gpuindex,self.version,self.computerid,self.user)

info_handler = logging.handlers.TimedRotatingFileHandler(filename='logs/info.log', when='D', interval=1, backupCount=7, encoding='utf-8')
app.logger.addHandler(info_handler)

def get_username():
    username=request.cookies.get('name')
    if username:
        username=base64.b64decode(username.encode()).decode()
    return username

@app.route('/',methods=['GET','POST'])
def login():
    if request.method=="GET":
        # username=request.cookies.get('name')
        username=get_username()
        if not username:
            return render_template('login.html')
        else:
            return redirect(url_for('index'))
    else:
        username=request.form['name']
        resp=make_response(render_template('index.html'))
        resp.set_cookie('name',base64.b64encode(username.encode()).decode())
        return resp

@app.route('/index')
def index():
    # username=request.cookies.get('name')
    username=get_username()
    if not username:
        return redirect(url_for('login'))
    else:
        return render_template('index.html')

@app.route('/getstate',methods=['GET'])
def getstate():
    # TODO: read db
    computers=Computer.query.all()
    res=[]
    for com in computers:
        id=com.id
        gpus=GPU.query.filter_by(computerid=id).all()
        gpus.sort(key=lambda o:o.gpuindex)
        res.append({
            'id':id,
            'nickname':com.nickname,
            'IP':com.IP,
            'MAC':com.MAC,
            'sshport':com.sshport,
            'gpunum':com.gpunum,
            'gpus':[[gpu.version,gpu.user] for gpu in gpus]
        })
    return json.dumps(res)

@app.route('/setstate',methods=['POST','PATCH'])
def setstate():
    if request.method=='POST':
        data=request.data
        data=data.decode('utf-8')
        data=json.loads(data)
        # app.logger.debug(data)
        # validate
        assert type(data['gpunum'])==int
        assert type(data['sshport'])==int and 0<data['sshport']<65536
        assert type(data['nickname'])==str
        assert type(data['gpuversions'])==str
        assert type(data['MAC'])==str and re.match(r"^\s*([0-9a-fA-F]{2,2}:){5,5}[0-9a-fA-F]{2,2}\s*$", data['MAC'])
        assert type(data['IP'])==str and re.match(r"^\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s*$", data['IP'])

        gpuversions=data['gpuversions'].split(';')
        gpuversions=[s.strip() for s in gpuversions]
        #ORM
        computer=Computer(data['IP'],data['MAC'],data['sshport'],data['gpunum'],data['nickname'])
        db.session.add(computer)
        db.session.commit()
        computerid=Computer.query.filter_by(MAC=data['MAC']).first().id
        app.logger.debug('computerid=%d'%computerid)
        for i,ver in enumerate(gpuversions):
            gpu=GPU(computerid,i,'none',ver)
            db.session.add(gpu)
        db.session.commit()
        app.logger.info("Add Computer %s @ %s %s:%d"%(computer.nickname,computer.MAC,computer.IP,computer.sshport))
        return "success"
    else: #PATCH
        data=request.data
        data=data.decode('utf-8')
        data=json.loads(data)
        # username=request.cookies.get('name')
        username=get_username()
        # app.logger.debug(data)
        # validate

        computerid=data.pop('computerid')
        gpuidx=data.pop('gpuidx')

        #ORM
        computer=Computer.query.filter_by(id=computerid).first_or_404()
        gpu=GPU.query.filter_by(computerid=computerid,gpuindex=gpuidx).first_or_404()
        # app.logger.debug(gpu.user)
        if gpu.user=='none' or gpu.user==username:
            GPU.query.filter_by(computerid=computerid,gpuindex=gpuidx).update(data)
        else:
            flask.abort(400)

        db.session.commit()
        app.logger.info("%s update %s : %s"%(username,gpu.__repr__(),json.dumps(data)))
        return "success"

@app.route('/editstate',methods=['POST'])
def editstate():
    data=request.data
    data=data.decode('utf-8')
    data=json.loads(data)
    # app.logger.debug(data)
    # validate
    assert type(data['id'])==int
    assert type(data['gpunum'])==int
    assert type(data['sshport'])==int and 0<data['sshport']<65536
    assert type(data['nickname'])==str
    assert type(data['gpuversions'])==str
    assert type(data['MAC'])==str and re.match(r"^\s*([0-9a-fA-F]{2,2}:){5,5}[0-9a-fA-F]{2,2}\s*$", data['MAC'])
    assert type(data['IP'])==str and re.match(r"^\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s*$", data['IP'])

    gpuversions=data['gpuversions'].split(';')
    gpuversions=[s.strip() for s in gpuversions]
    assert len(gpuversions)==data['gpunum']
    #ORM
    # computer=Computer(data['IP'],data['MAC'],data['sshport'],data['gpunum'],data['nickname'])
    computer=Computer.query.filter_by(id=data['id']).first_or_404()
    computerid=computer.id

    app.logger.debug('computerid=%d'%computerid)
    Computer.query.filter_by(id=data['id']).update({
        'gpunum':data['gpunum'],
        'sshport':data['sshport'],
        'nickname':data['nickname'],
        'MAC':data['MAC'],
        'IP':data['IP'],
        })
    db.session.commit()
    app.logger.info("Edit Computer %s @ %s %s:%d"%(computer.nickname,computer.MAC,computer.IP,computer.sshport))
    for i,ver in enumerate(gpuversions):
        gpu=GPU.query.filter_by(computerid=computerid,gpuindex=i).first()
        if gpu:
            if ver!=gpu.version:
                app.logger.debug('mod %d %s'%(i,ver))
                GPU.query.filter_by(computerid=computerid,gpuindex=i).update({
                    'version':ver,
                })
                app.logger.info("Edit GPU%d from %s to %s @ computer %s @%s:%d"%(i,gpu.version,ver,computer.nickname,computer.IP,computer.sshport))
        else:
            app.logger.debug('add %d %s'%(i,ver))
            gpu=GPU(computerid,i,'none',ver)
            db.session.add(gpu)
            app.logger.info("Add GPU%d %s @ computer %s @%s:%d"%(i,ver,computer.nickname,computer.IP,computer.sshport))
    db.session.commit()
    gpus=GPU.query.filter_by(computerid=computerid).all()
    for gpu in gpus:
        if gpu.gpuindex>=data['gpunum']:
            app.logger.info("Delete GPU%d %s @ computer %s @%s:%d"%(gpu.gpuindex,gpu.version,computer.nickname,computer.IP,computer.sshport))
            db.session.delete(gpu)
    db.session.commit()
    return "success"


@app.route('/manage')
def manage():
    return render_template('manage.html')

if __name__=='__main__':
    app.run(debug=False,host='0.0.0.0')
