(function(root){
'use strict';
function seed(){return {schema:1,title:'星河音乐会 · 开场样板',version:1,status:'编排中',rehearsedVersion:null,published:null,cursor:0,devices:{lighting:true,video:true,audio:true,camera:true},cues:[{id:'C001',name:'开场氛围',lighting:'蓝色环境光 35%',video:'星河背景（占位素材）',audio:'开场快照（模拟）',camera:'全景机位',status:'待执行'},{id:'C002',name:'主唱入场',lighting:'主唱面光 65%',video:'舞台标题（占位素材）',audio:'人声快照（模拟）',camera:'主唱中景',status:'待执行'},{id:'C003',name:'结束谢幕',lighting:'暖白全场 70%',video:'谢幕字幕（占位素材）',audio:'谢幕快照（模拟）',camera:'舞台全景',status:'待执行'}],logs:[],artifacts:[],run:null};}
function log(s,message){s.logs.unshift({at:new Date().toISOString(),message});}
function available(s){return Object.values(s.devices).every(Boolean);}
function edit(s,data){if(['运行中','故障暂停','人工接管'].includes(s.status))throw Error('运行期间不能修改节目');if(!data.name?.trim())throw Error('请填写 cue 名称');const c={id:'C'+Date.now().toString(36)+'-'+s.cues.length,name:data.name.trim(),lighting:data.lighting?.trim()||'保持灯光',video:data.video?.trim()||'保持画面',audio:data.audio?.trim()||'保持调音快照',camera:data.camera?.trim()||'保持机位',status:'待执行'};s.cues.push(c);s.version++;s.rehearsedVersion=null;s.status='编排中';log(s,'添加 cue，排练与发布版本已失效');}
function act(s,action,arg){
if(action==='generate'){if(['运行中','故障暂停','人工接管'].includes(s.status))throw Error('运行期间不能生成方案');s.artifacts.push({id:'A'+Date.now().toString(36),type:arg,version:s.version,text:arg==='视频素材'?'视频生成任务模拟完成：仅生成占位描述，无视频文件。':'灯光方案模拟完成：按现有 cue 展示参数，无光学仿真。'});log(s,arg+'规则模拟任务完成');}
else if(action==='rehearse'){if(!['编排中','排练通过','已发布','已完成','已终止'].includes(s.status))throw Error('当前状态不可排练');if(!available(s))throw Error('设备离线，排练未通过');s.rehearsedVersion=s.version;s.status='排练通过';log(s,'模拟排练通过，版本 v'+s.version+'；未测量真实延迟与预演偏差');}
else if(action==='publish'){if(s.status!=='排练通过'||s.rehearsedVersion!==s.version)throw Error('当前版本必须先通过排练');s.published=JSON.parse(JSON.stringify({version:s.version,cues:s.cues}));s.status='已发布';log(s,'已锁定并发布版本 v'+s.version);}
else if(action==='start'){if(s.status!=='已发布'||!s.published||s.published.version!==s.version)throw Error('请先发布当前版本');if(!available(s))throw Error('设备离线，无法开演');s.cursor=0;s.cues.forEach(x=>x.status='待执行');s.status='运行中';s.run={id:'RUN'+Date.now().toString(36),version:s.version,started:new Date().toISOString(),executed:0,failures:0};log(s,'模拟演出开始');}
else if(action==='next'){if(s.status!=='运行中')throw Error('当前不在运行状态');if(!available(s)){s.status='故障暂停';s.run.failures++;log(s,'设备异常，暂停 cue；等待恢复或人工接管');return;}
 const cue=s.cues[s.cursor];if(!cue)throw Error('没有待执行 cue');cue.status='已执行';s.cursor++;s.run.executed++;log(s,`执行 ${cue.name}：灯光／视频／调音／机位返回模拟确认`);if(s.cursor===s.cues.length){s.status='已完成';s.run.finished=new Date().toISOString();log(s,'全部 cue 已完成，执行报告已生成');}}
else if(action==='device'){if(!Object.hasOwn(s.devices,arg))throw Error('设备不存在');s.devices[arg]=!s.devices[arg];log(s,arg+(s.devices[arg]?'模拟设备恢复在线':'模拟设备离线'));if(!s.devices[arg]&&s.status==='运行中'){s.status='故障暂停';s.run.failures++;log(s,'检测故障，演出暂停，当前 cue 未前进');}}
else if(action==='recover'){if(s.status!=='故障暂停')throw Error('当前无故障暂停');if(!available(s))throw Error('请先恢复所有模拟设备');s.status='运行中';log(s,'恢复至未执行 cue，等待人工触发继续');}
else if(action==='takeover'){if(!['运行中','故障暂停'].includes(s.status))throw Error('当前不可接管');s.status='人工接管';log(s,'已停止自动执行并交由人工；模拟系统不控制真实设备');}
else if(action==='resume'){if(s.status!=='人工接管'||!available(s))throw Error('请先确认所有设备在线');s.status='运行中';log(s,'人工确认后返回自动流程，等待触发');}
else if(action==='stop'){if(!['运行中','故障暂停','人工接管'].includes(s.status))throw Error('当前不可终止');s.status='已终止';s.run.finished=new Date().toISOString();log(s,'演出已终止，保留执行进度与报告');}
else throw Error('未知操作');}
const api={seed,edit,act,available};if(typeof module!=='undefined')module.exports=api;root.Show=api;
})(typeof globalThis!=='undefined'?globalThis:this);
