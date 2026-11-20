'use strict';
const crypto=require('node:crypto');const {LiveShow,ShowError}=require('./live-show.cjs');let controller;
function getShow(base){if(!controller){controller=new LiveShow(base);const timer=setInterval(()=>controller.tick().catch(()=>{}),200);timer.unref();}return controller;}
function token(req){return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('show_session='))?.slice(13)||'';}
function requireOperator(req,base){const c=getShow(base);if(!c.session(token(req)))throw new ShowError('请先在真实演出闭环页登录操作员',401);return c;}
function gatewayAuth(req){const configured=process.env.GATEWAY_TOKEN||'',given=(req.headers.authorization||'').replace(/^Bearer /,'');if(configured.length<24||!crypto.timingSafeEqual(crypto.createHash('sha256').update(configured).digest(),crypto.createHash('sha256').update(given).digest()))throw new ShowError('网关凭据无效',401);}
async function route({req,res,u,body,base}){const c=getShow(base);
if(u.pathname==='/api/health')return {ok:true,service:'show-automation',storage:'SQLite'};
if(u.pathname==='/api/gateway/poll'&&req.method==='POST'){gatewayAuth(req);return c.poll();}
if(u.pathname==='/api/gateway/result'&&req.method==='POST'){gatewayAuth(req);return c.result(body);}
if(u.pathname==='/api/show/login'&&req.method==='POST'){const t=c.login(body.password);res.setHeader('Set-Cookie',`show_session=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.RENDER?'; Secure':''}`);return {ok:true};}
if(u.pathname==='/api/show/session'&&req.method==='GET')return {operator:c.session(token(req))};
if(u.pathname==='/api/show/logout'&&req.method==='POST'){const t=token(req);if(t)c.db.prepare('DELETE FROM sessions WHERE hash=?').run(crypto.createHash('sha256').update(t).digest('hex'));res.setHeader('Set-Cookie','show_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return {ok:true};}
if(u.pathname==='/api/show/state'&&req.method==='GET')return c.snapshot();
requireOperator(req,base);
if(u.pathname==='/api/show/preview'&&req.method==='GET')return c.command('preview');
if(u.pathname==='/api/show/obs-status'&&req.method==='GET')return c.command('status');
const m=u.pathname.match(/^\/api\/show\/actions\/(prepare|edit|rehearse|publish|start|next|pause|recover|takeover|stop|fault)$/);if(m&&req.method==='POST')return c.act(m[1],body,req.headers['idempotency-key']);
throw new ShowError('接口不存在或方法不允许',404);}
module.exports={route,getShow,requireOperator,gatewayAuth};
