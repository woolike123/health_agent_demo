import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  ClipboardList,
  ClipboardPlus,
  FileText,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  RefreshCw,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const STORAGE_KEY = "health-agent-static-data";
const safetyText = "不诊断 · 不开药 · 不替代医生";
const fullSafetyText = "本工具仅提供就医紧急程度建议、健康记录整理和报告辅助解读，不诊断、不开药、不替代医生。";
const glucoseTypes = ["空腹血糖", "餐后1小时血糖", "餐后2小时血糖", "睡前血糖", "随机血糖", "其他"];
const symptomTags = ["头晕", "头痛", "胸闷", "咳嗽", "发热", "腹痛", "恶心", "乏力", "心慌", "视物异常"];
const navItems = [
  ["home", "首页", Home],
  ["triage", "分诊助手", MessageCircle],
  ["records", "健康记录", ClipboardPlus],
  ["trends", "趋势分析", BarChart3],
  ["reports", "报告解读", FileText],
  ["profile", "个人档案", UserRound],
  ["data", "数据管理", ClipboardList],
];

const defaultData = {
  profile: { name: "用户", age: "", sex: "", height: "", weight: "", conditions: "", allergies: "", medications: "", note: "" },
  bloodPressure: [],
  bloodGlucose: [],
  triageSessions: [],
};

function loadData() {
  try {
    return { ...defaultData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function splitList(text) {
  return String(text || "").split(/[,，、\n]/).map((item) => item.trim()).filter(Boolean);
}

function toggle(list, item) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brandLogo" src="./health_resources/logo.png" alt="Health Agent 智能就医与慢病管理" />
      </div>
      <nav className="nav">
        {navItems.map(([key, label, Icon]) => (
          <button className={page === key ? "navItem active" : "navItem"} key={key} onClick={() => setPage(key)} type="button">
            <Icon size={18} />{label}
          </button>
        ))}
      </nav>
      <p className="safetyNote">{safetyText}</p>
    </aside>
  );
}

function PageHeader({ eyebrow, title, action }) {
  return <header className="pageHeader"><div><p>{eyebrow}</p><h1>{title}</h1></div>{action}</header>;
}

function StatCard({ title, value, note, status }) {
  return <section className="statCard"><span>{title}</span><strong>{value}</strong><small>{note}</small><em>{status}</em></section>;
}

function HomePage({ data, setPage, refresh }) {
  const bp = data.bloodPressure.at(-1);
  const glucose = data.bloodGlucose.at(-1);
  return (
    <>
      <section className="productHero">
        <div className="heroCopy">
          <p className="eyebrow">智能分诊 · 慢病管理 · 报告解读</p>
          <h1>你的智能就医分诊助手</h1>
          <p>根据症状、血压血糖记录和报告信息，帮你判断就医紧急程度，并推荐合适科室。</p>
          <div className="buttonRow">
            <button className="btn primary" onClick={() => setPage("triage")} type="button">开始分诊 →</button>
            <button className="btn secondary" onClick={() => setPage("records")} type="button">记录健康数据</button>
          </div>
        </div>
        <div className="heroIllustration">
          <img src="./health_resources/image.png" alt="Health Agent 健康助手界面展示" />
        </div>
      </section>
      <div className="featureGrid">
        <section className="featureCard"><MessageCircle size={22} /><h2>智能分诊</h2><p>多轮追问，推荐就医科室。</p></section>
        <section className="featureCard"><BarChart3 size={22} /><h2>慢病趋势</h2><p>记录血压、血糖变化。</p></section>
        <section className="featureCard"><FileText size={22} /><h2>报告解读</h2><p>辅助理解报告指标。</p></section>
      </div>
      <section className="sectionIntro">
        <h2>今日健康概览</h2>
        <p>你好，{data.profile.name || "用户"}，这是你最近一次健康记录。</p>
        <button className="iconButton" onClick={refresh} type="button"><RefreshCw size={18} /></button>
      </section>
      <div className="dashboardGrid">
        <StatCard title="最近血压" value={bp ? `${bp.systolic}/${bp.diastolic} mmHg` : "暂无记录"} note={bp ? `${formatDate(bp.measured_at)} · 心率 ${bp.heart_rate || "-"}` : "记录一次血压后，这里会显示最新结果。"} status={bp && (bp.systolic >= 140 || bp.diastolic >= 90) ? "需要关注" : "健康记录"} />
        <StatCard title="最近血糖" value={glucose ? `${glucose.value} mmol/L` : "暂无记录"} note={glucose ? `${formatDate(glucose.measured_at)} · ${glucose.measurement_type}` : "记录一次血糖后，这里会显示最新结果。"} status={glucose ? "健康记录" : "待记录"} />
      </div>
      <div className="safetyBand">{fullSafetyText}</div>
    </>
  );
}

function MapLinks({ keyword = "综合医院 急诊", urgent = false }) {
  const encoded = encodeURIComponent(keyword);
  return (
    <section className={urgent ? "emergencyResult" : "tablePanel"}>
      <div className="panelTitle"><Building2 size={18} /><h2>{urgent ? "急诊提示" : "附近医院入口"}</h2></div>
      {urgent && <p><strong>建议科室：急诊科。</strong> 如果你现在有明显危险信号，建议优先就近急诊或联系急救服务。</p>}
      <p className="hint">静态版不会读取定位。你可以打开地图后搜索附近医院。</p>
      <div className="linkRow">
        <a href={`https://uri.amap.com/search?keyword=${encoded}`} target="_blank" rel="noreferrer">高德地图</a>
        <a href={`https://map.baidu.com/search/${encoded}`} target="_blank" rel="noreferrer">百度地图</a>
        <a href={`https://www.google.com/maps/search/${encoded}`} target="_blank" rel="noreferrer">Google 地图</a>
      </div>
    </section>
  );
}

function TriagePage({ data, updateData }) {
  const [step, setStep] = useState("screen");
  const [symptomText, setSymptomText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageNote, setImageNote] = useState("");
  const [messages, setMessages] = useState([]);
  const [notice, setNotice] = useState("");

  function reset() {
    setStep("screen");
    setSymptomText("");
    setSelectedTags([]);
    setImageNote("");
    setMessages([]);
    setNotice("");
  }

  function start() {
    const user = [symptomText, selectedTags.join("、"), imageNote].filter(Boolean).join("\n") || "我想获得分诊建议。";
    const urgent = /胸痛|胸闷|呼吸困难|昏厥|说话不清|大量出血|自伤/.test(user);
    const reply = urgent
      ? `【紧急程度】建议尽快就近急诊或联系急救服务。\n【建议科室】急诊科\n【原因】描述中包含可能需要优先处理的危险信号。\n【下一步】避免自行驾车，尽量由家人陪同或联系急救服务。\n【安全提示】${fullSafetyText}`
      : `【追问】请选择更接近的一项：A. 突然出现 B. 持续数小时 C. 持续几天 D. 反复出现\n\n【安全提示】${fullSafetyText}`;
    setMessages([{ role: "user", content: user }, { role: "assistant", content: reply }]);
  }

  function continueChat(text) {
    const reply = `【紧急程度】暂未看到明确危险信号，可根据不适程度选择门诊咨询。\n【建议科室】全科医学科或相关专科门诊\n【原因】当前信息仍有限，需要结合持续时间、严重程度和检查结果判断。\n【下一步】记录症状变化和血压血糖等数据，必要时线下就医。\n【安全提示】${fullSafetyText}`;
    setMessages([...messages, { role: "user", content: text }, { role: "assistant", content: reply }]);
  }

  function saveSession() {
    const session = { created_at: nowIso(), symptom_text: symptomText, symptom_tags: selectedTags, image_note: imageNote, messages };
    updateData({ ...data, triageSessions: [...data.triageSessions, session] });
    setNotice("本次分诊已保存。");
  }

  return (
    <>
      <PageHeader eyebrow="分诊建议" title="分诊助手" action={<button className="btn danger" onClick={reset} type="button">重新分诊</button>} />
      {notice && <div className="infoBanner">{notice}</div>}
      {step === "screen" && (
        <section className="heroCard">
          <div className="panelTitle"><AlertTriangle size={22} /><h2>是否存在紧急症状？</h2></div>
          <p>如果你现在有明显危险信号，建议优先就近急诊或联系急救服务。</p>
          <div className="emergencyList">
            {["严重胸痛或胸闷", "呼吸困难", "意识不清或昏厥", "一侧肢体无力或说话不清", "大量出血", "严重过敏反应", "突发剧烈头痛或视物异常", "自伤或伤害他人的想法", "都没有"].map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="buttonRow">
            <button className="btn danger" onClick={() => setStep("urgent")} type="button">有紧急症状</button>
            <button className="btn primary" onClick={() => setStep("chat")} type="button">都没有</button>
          </div>
        </section>
      )}
      {step === "urgent" && <MapLinks keyword="急诊医院" urgent />}
      {step === "chat" && (
        <div className="triageLayout">
          <section className="formPanel">
            <h2>症状信息</h2>
            <label>症状描述<textarea value={symptomText} onChange={(event) => setSymptomText(event.target.value)} placeholder="例如：今天下午开始头晕，有点恶心，测血压 150/95。" /></label>
            <div><p className="fieldLabel">症状标签</p><div className="tagGrid">{symptomTags.map((item) => <button className={selectedTags.includes(item) ? "tag active" : "tag"} key={item} onClick={() => setSelectedTags(toggle(selectedTags, item))} type="button">{item}</button>)}</div></div>
            <label>手动补充关键信息<textarea value={imageNote} onChange={(event) => setImageNote(event.target.value)} placeholder="可以输入报告指标、图片中看到的信息，或补充症状细节。" /></label>
            <button className="btn primary fullButton" onClick={start} type="button">开始分诊</button>
          </section>
          <section className="chatPanel">
            <h2>分诊对话</h2>
            <div className="chatMessages">{messages.length === 0 && <div className="empty">填写症状信息后，点击“开始分诊”。</div>}{messages.map((item, index) => <div className={item.role === "user" ? "chatBubble user" : "chatBubble assistant"} key={index}>{item.content}</div>)}</div>
            {messages.length > 0 && <div className="buttonRow"><button className="btn secondary" onClick={() => continueChat("B. 持续数小时")} type="button">选择 B 并继续</button><button className="btn primary" onClick={saveSession} type="button"><Save size={17} />保存本次分诊</button></div>}
            {messages.length > 1 && <MapLinks keyword="综合医院 门诊" />}
          </section>
        </div>
      )}
    </>
  );
}

function RecordsPage({ data, updateData }) {
  const [tab, setTab] = useState("bp");
  const [message, setMessage] = useState("");
  const [bp, setBp] = useState({ systolic: 130, diastolic: 80, heart_rate: 75, symptoms: "" });
  const [glucose, setGlucose] = useState({ measurement_type: "空腹血糖", value: 6.5, note: "" });

  function saveBp(event) {
    event.preventDefault();
    updateData({ ...data, bloodPressure: [...data.bloodPressure, { ...bp, systolic: Number(bp.systolic), diastolic: Number(bp.diastolic), heart_rate: Number(bp.heart_rate), symptoms: splitList(bp.symptoms), measured_at: nowIso() }] });
    setMessage("血压记录已保存。");
  }

  function saveGlucose(event) {
    event.preventDefault();
    updateData({ ...data, bloodGlucose: [...data.bloodGlucose, { ...glucose, value: Number(glucose.value), measured_at: nowIso() }] });
    setMessage("血糖记录已保存。");
  }

  return (
    <>
      <PageHeader eyebrow="健康记录" title="记录血压与血糖" />
      {message && <div className="infoBanner">{message}</div>}
      <div className="tabs"><button className={tab === "bp" ? "tab active" : "tab"} onClick={() => setTab("bp")} type="button">血压记录</button><button className={tab === "glucose" ? "tab active" : "tab"} onClick={() => setTab("glucose")} type="button">血糖记录</button></div>
      {tab === "bp" && <form className="formPanel recordForm compactForm" onSubmit={saveBp}><h2>血压记录</h2><label>收缩压 mmHg<input value={bp.systolic} onChange={(event) => setBp({ ...bp, systolic: event.target.value })} type="number" /></label><label>舒张压 mmHg<input value={bp.diastolic} onChange={(event) => setBp({ ...bp, diastolic: event.target.value })} type="number" /></label><label>心率 次/分钟<input value={bp.heart_rate} onChange={(event) => setBp({ ...bp, heart_rate: event.target.value })} type="number" /></label><label>相关症状<input value={bp.symptoms} onChange={(event) => setBp({ ...bp, symptoms: event.target.value })} placeholder="可选，例如：头晕" /></label><button className="btn primary formSubmit" type="submit">保存血压记录</button></form>}
      {tab === "glucose" && <form className="formPanel recordForm compactForm" onSubmit={saveGlucose}><h2>血糖记录</h2><label>测量类型<select value={glucose.measurement_type} onChange={(event) => setGlucose({ ...glucose, measurement_type: event.target.value })}>{glucoseTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>血糖值 mmol/L<input value={glucose.value} onChange={(event) => setGlucose({ ...glucose, value: event.target.value })} type="number" step="0.1" /></label><label>备注<input value={glucose.note} onChange={(event) => setGlucose({ ...glucose, note: event.target.value })} placeholder="可选" /></label><button className="btn primary formSubmit" type="submit">保存血糖记录</button></form>}
    </>
  );
}

function TrendsPage({ data }) {
  const [analysis, setAnalysis] = useState("");
  const bpData = useMemo(() => data.bloodPressure.map((item) => ({ date: formatDate(item.measured_at), systolic: item.systolic, diastolic: item.diastolic })), [data]);
  const glucoseData = useMemo(() => data.bloodGlucose.map((item) => ({ date: formatDate(item.measured_at), glucose: item.value, type: item.measurement_type })), [data]);
  function analyze() {
    if (data.bloodPressure.length + data.bloodGlucose.length < 4) {
      setAnalysis("目前记录较少，建议连续记录 7–14 天后再查看趋势。");
      return;
    }
    setAnalysis(`【趋势总结】已根据本地健康记录生成辅助观察。\n【需要关注】若血压或血糖持续高于平时水平，建议记录具体时间和状态。\n【建议】保持连续记录，带着记录咨询医生更高效。\n【可以问医生】这些波动是否需要进一步检查？\n【安全提示】${fullSafetyText}`);
  }
  return <><PageHeader eyebrow="趋势分析" title="血压与血糖变化" action={<button className="btn primary" onClick={analyze} type="button">智能分析</button>} /><div className="chartGrid"><section className="chartPanel"><h2>血压趋势</h2>{bpData.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={bpData}><CartesianGrid stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Line dataKey="systolic" name="收缩压" stroke="#0f766e" strokeWidth={3} /><Line dataKey="diastolic" name="舒张压" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer> : <div className="empty">暂无血压记录</div>}</section><section className="chartPanel"><h2>血糖趋势</h2>{glucoseData.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={glucoseData}><CartesianGrid stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis /><Tooltip formatter={(value, name, props) => [`${value} mmol/L`, props.payload.type || name]} /><Line dataKey="glucose" name="血糖" stroke="#dc2626" strokeWidth={3} /></LineChart></ResponsiveContainer> : <div className="empty">暂无血糖记录</div>}</section></div><section className="analysisCard aiOutputCard"><h2>智能分析结果</h2>{analysis ? <div>{analysis}</div> : <p className="empty">点击“智能分析”后，这里会显示血压、血糖趋势的辅助解读。</p>}</section></>;
}

function ReportPage() {
  const [fileName, setFileName] = useState("");
  const [reportType, setReportType] = useState("化验单");
  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState("");
  function recognize(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setReportText("图片识别暂不可用，请手动输入报告中的关键指标。");
  }
  function analyze(event) {
    event.preventDefault();
    if (reportText.trim().length < 8) {
      setResult("报告内容较少，请补充更多指标信息后再进行智能解读。");
      return;
    }
    setResult(`【报告摘要】已整理你输入的${reportType}内容。\n【需要关注】请重点核对异常箭头、参考范围和单位。\n【建议科室】可根据报告来源咨询开单科室或全科医学科。\n【可以问医生】这些指标变化是否需要复查？是否和既往病史有关？\n【安全提示】${fullSafetyText}`);
  }
  return <><PageHeader eyebrow="智能解读" title="报告解读" /><div className="formGrid"><form className="formPanel" onSubmit={analyze}><h2>报告信息</h2><label>报告类型<select value={reportType} onChange={(event) => setReportType(event.target.value)}>{["化验单", "体检报告", "药盒照片", "其他"].map((item) => <option key={item}>{item}</option>)}</select></label><label>上传图片或 PDF<input accept="image/*,.pdf" type="file" onChange={recognize} /></label>{fileName && <div className="infoBox">已选择：{fileName}。静态版不会上传文件，请在下方补充报告关键指标。</div>}<label>报告内容 / 关键指标<textarea value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="例如：空腹血糖 6.8 mmol/L，甘油三酯 2.1 mmol/L，血压 145/92 mmHg。" /></label><button className="btn primary fullButton" type="submit">智能解读</button></form><section className="analysisCard"><h2>报告解读</h2>{result ? <div>{result}</div> : <p className="empty">上传报告或填写关键指标后，可获得简短、清晰的辅助解读。</p>}</section></div></>;
}

function ProfilePage({ data, updateData }) {
  const [profile, setProfile] = useState(data.profile);
  const [message, setMessage] = useState("");
  function submit(event) {
    event.preventDefault();
    updateData({ ...data, profile });
    setMessage("个人档案已保存。");
  }
  return <><PageHeader eyebrow="健康档案" title="个人档案" />{message && <div className="infoBanner">{message}</div>}<p className="sectionIntro">完善基础信息后，分诊和趋势分析会更贴合你的情况。</p><form className="formPanel profileForm" onSubmit={submit}><h2 className="wideField">基础信息</h2><label>姓名<input value={profile.name || ""} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label><label>年龄<input value={profile.age || ""} onChange={(event) => setProfile({ ...profile, age: event.target.value })} type="number" /></label><label>性别<select value={profile.sex || ""} onChange={(event) => setProfile({ ...profile, sex: event.target.value })}><option value="">请选择</option><option>女</option><option>男</option><option>其他</option></select></label><label>身高 cm<input value={profile.height || ""} onChange={(event) => setProfile({ ...profile, height: event.target.value })} type="number" /></label><label>体重 kg<input value={profile.weight || ""} onChange={(event) => setProfile({ ...profile, weight: event.target.value })} type="number" /></label><h2 className="wideField">健康背景</h2><label>慢病史<textarea value={profile.conditions || ""} onChange={(event) => setProfile({ ...profile, conditions: event.target.value })} /></label><label>过敏史<textarea value={profile.allergies || ""} onChange={(event) => setProfile({ ...profile, allergies: event.target.value })} /></label><label>长期用药<textarea value={profile.medications || ""} onChange={(event) => setProfile({ ...profile, medications: event.target.value })} /></label><label className="wideField">备注<textarea value={profile.note || ""} onChange={(event) => setProfile({ ...profile, note: event.target.value })} /></label><button className="btn primary fullButton wideField" type="submit">保存个人档案</button></form></>;
}

function DataPage({ data, updateData }) {
  function remove(kind, index) {
    if (!window.confirm("确认删除这条记录吗？")) return;
    if (kind === "bp") updateData({ ...data, bloodPressure: data.bloodPressure.filter((_, i) => i !== index) });
    if (kind === "glucose") updateData({ ...data, bloodGlucose: data.bloodGlucose.filter((_, i) => i !== index) });
    if (kind === "session") updateData({ ...data, triageSessions: data.triageSessions.filter((_, i) => i !== index) });
  }
  function clearAll() {
    if (!window.confirm("确认清空所有静态数据吗？")) return;
    updateData(defaultData);
  }
  return <><PageHeader eyebrow="健康记录" title="数据管理" action={<button className="btn danger" onClick={clearAll} type="button">清空数据</button>} /><section className="dataSection"><h2>血压记录</h2>{data.bloodPressure.length === 0 && <div className="empty">暂无血压记录</div>}{data.bloodPressure.map((item, index) => <article className="recordCard" key={`${item.measured_at}-${index}`}><div><h3>{item.systolic}/{item.diastolic} mmHg</h3><p>{formatDate(item.measured_at)}</p></div><p>心率 {item.heart_rate || "-"} 次/分</p><div className="actionCell"><button className="btn danger" onClick={() => remove("bp", index)} type="button"><Trash2 size={15} />删除</button></div></article>)}</section><section className="dataSection"><h2>血糖记录</h2>{data.bloodGlucose.length === 0 && <div className="empty">暂无血糖记录</div>}{data.bloodGlucose.map((item, index) => <article className="recordCard" key={`${item.measured_at}-${index}`}><div><h3>{item.value} mmol/L</h3><p>{formatDate(item.measured_at)}</p></div><p>{item.measurement_type}</p><div className="actionCell"><button className="btn danger" onClick={() => remove("glucose", index)} type="button"><Trash2 size={15} />删除</button></div></article>)}</section><section className="dataSection"><h2>分诊记录</h2>{data.triageSessions.length === 0 && <div className="empty">暂无分诊记录</div>}{data.triageSessions.map((session, index) => <article className="recordCard" key={`${session.created_at}-${index}`}><div><h3>{session.symptom_text || "分诊记录"}</h3><p>{formatDate(session.created_at)}</p></div><details><summary>查看分诊内容</summary>{session.messages?.map((msg, i) => <p key={i}>{msg.role === "user" ? "用户" : "助手"}：{msg.content}</p>)}</details><div className="actionCell"><button className="btn danger" onClick={() => remove("session", index)} type="button"><Trash2 size={15} />删除</button></div></article>)}</section></>;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [data, setData] = useState(loadData);
  function updateData(nextData) {
    setData(nextData);
    saveData(nextData);
  }
  function refresh() {
    setData(loadData());
  }
  return (
    <div className="appShell">
      <Sidebar page={page} setPage={setPage} />
      <main className="content fadeIn">
        {page === "home" && <HomePage data={data} setPage={setPage} refresh={refresh} />}
        {page === "triage" && <TriagePage data={data} updateData={updateData} />}
        {page === "records" && <RecordsPage data={data} updateData={updateData} />}
        {page === "trends" && <TrendsPage data={data} />}
        {page === "reports" && <ReportPage />}
        {page === "profile" && <ProfilePage data={data} updateData={updateData} />}
        {page === "data" && <DataPage data={data} updateData={updateData} />}
      </main>
    </div>
  );
}
