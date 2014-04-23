
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var wechat = require('wechat');
var querystring=require('querystring');

var log4js = require('log4js');
var app = express();
var API = require('wechat').API;
var api = new API('wx0c9feaf799a086d4', '14eea48be4a7dea717ab26cc460eb2d7');
//log config
log4js.configure({
    appenders: [
        { type: 'console' },
        { type: 'file', filename: 'logs/log.log',category: 'cheese' }
    ],
    replaceConsole: true
});
log4js.setGlobalLogLevel("message");
var logger = log4js.getLogger("cheese");


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.query());

app.use(express.cookieParser());
app.use(express.session({secret: 'keyboard cat', cookie: {maxAge: 60000}}));

var suggestList=[];
var CUSTOMERSERVICE=  "ovvpTuMN-aeRhPTf4_t_j8HKXaPM";

app.use('/wechat', wechat('like').text(function (message, req, res, next) {      //处理文字消息

    if (message.Content === '退出投诉') {
            req.wxsession.complaint=false;
            res.reply("您已经退出投诉模式");
    }
    if(req.wxsession.complaint){              //session中如果在投诉模式中，输入的文字将被转发
        res.reply('已经转达您的意见，要退出投诉模式请输入"退出投诉"');
        api.sendText(CUSTOMERSERVICE,message.Content,function (err, data) {

        });
        return;
    }

    if (message.Content === 'question') {  //进入答题模式
        res.wait('questionView');
    }

}).image(function (message, req, res, next) {
        if(req.wxsession.complaint){
            res.reply('已经转达您的意见，要退出投诉模式请输入"退出投诉"');
            api.sendImage(CUSTOMERSERVICE,message.MediaId,function (err, data) {

            });
            return;
        }
    }).voice(function (message, req, res, next) {
        logger.info(message) ;
        if(req.wxsession.complaint){
            res.reply('已经转达您的意见，要退出投诉模式请输入"退出投诉"');
            api.sendVoice(CUSTOMERSERVICE,message.MediaId,function (err, data) {

            });
            return;
        }
    }).video(function (message, req, res, next) {
        res.reply('auto reqly 4 video');
    }).location(function (message, req, res, next) {
        res.reply('auto reqly 4 location');
    }).link(function (message, req, res, next) {
        res.reply('auto reqly 4 link');
    }).event(function (message, req, res, next) {       //处理事件消息
        logger.info(message) ;
        if(message.Event==='CLICK'){
            if(message.EventKey==='LAST_EVENT'){
                var articles = [
                    {
                        "title":"新品鉴赏(1)",
                        "description":"抓住盘发的本质，改变并发现惊喜",
                        "url":"http://www.binf.cn/",
                        "picurl":"http://www.binf.cn/upload/201312/23/201312232251106694.png"
                    }];
                res.reply(articles);


            }else      if(message.EventKey==='NEAR_ALLIANCE'){
                api.getUser(message.FromUserName,function (err, data) {
                    if(err){
                        logger.info(err) ;
                    }
                    var regards="亲爱的 "+data.nickname+"  ，正在帮您查找 "+data.province+" "+data.city+" 的流行美，请稍候...";
                    res.reply(regards);
                    var baiduMap = [
                        {
                            "title":"您身边的流行美",
                            "description":"发现身边的惊喜",
                            "url":"http://map.baidu.com/?newmap=1&ie=utf-8&s=s%26wd%3D%E6%B5%81%E8%A1%8C%E7%BE%8E",
                            "picurl":"http://www.binf.cn/templates/liuxingmei/images/erweima.gif"
                        }];

                    api.sendNews(message.FromUserName,baiduMap,function (err, data) {
                        if(err){
                            logger.info(err) ;
                        }
                    });
                });


            }else      if(message.EventKey==='COMPLAINT'){                 //接受投诉事件
                var complaintReply="请您输入语音或者文字，我们将尽快处理您的投诉：）";
                req.wxsession.complaint=true;
                res.reply(complaintReply);
                api.getUser(message.FromUserName,function (err, data) {
                    if(err){
                        logger.info(err) ;
                    }
                    var complaintStr=data.nickname+"发来投诉";
                    api.sendText(CUSTOMERSERVICE,complaintStr,function (err, data) {
                        if(err){
                            logger.info(err) ;
                        }
                    });
                });

            }
        }
    }).middlewarify());



var List = require('wechat').List;
List.add('questionView', [
    ['回复{a}查看我的性别', function (message, req, res) {
        res.reply('我是个妹纸哟');
    }],
    ['回复{b}查看我的年龄', function (message, req, res) {
        res.reply('我今年18岁');
    }],
    ['回复{c}查看我的收入', '这样的事情怎么好意思告诉你啦- -']
]);



//List.add('menuView', [
//    ['回复{c}建立新菜单', function (message, req, res) {
//        var menuString={
//            "button": [
//                {
//                    "type": "click",
//                    "name": "最新活动",
//                    "key": "LAST_EVENT"
//                },
//                {
//                    "type": "click",
//                    "name": "最近分店",
//                    "key": "NEAR_ALLIANCE"
//                },
//                {
//                    "name": "帮助",
//                    "sub_button": [
//                        {
//                            "type": "click",
//                            "name": "建议",
//                            "key": "SUGGEST"
//                        },
//                        {
//                            "type": "click",
//                            "name": "投诉",
//                            "key": "COMPLAINT"
//                        },
//                        {
//                            "type": "view",
//                            "name": "关于我们",
//                            "url": "http://www.binf.cn/"
//                        }
//                    ]
//                }
//            ]
//        };
//        api.createMenu(menuString,function (err, menu) {
//            if(err){
//                logger.info(err) ;
//            }
//            res.reply(JSON.stringify(menu));
//        });
//
//    }],
//    ['回复{v}查看当前菜单', function (message, req, res) {
//        api.getMenu(function (err, menu) {
//            if(err){
//                logger.info(err) ;
//            }
//            res.reply(JSON.stringify(menu));
//        });
//    }]
//]);
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
