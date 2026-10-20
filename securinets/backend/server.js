import express from 'express'; import mongoose from 'mongoose'; import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; import cors from 'cors';
const { MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const S = mongoose.Schema;
const User = mongoose.model('User', new S({ name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'member' }, department: String, paid: { type: Boolean, default: false }, year: Number }));
const Settings = mongoose.model('Settings', new S({ signupOpen: { type: Boolean, default: false }, year: Number }));
const Announcement = mongoose.model('Announcement', new S({ kind: String, title: String, date: Date, body: String, author: String }, { timestamps: true }));
const Message = mongoose.model('Message', new S({ author: String, text: String }, { timestamps: true }));
const News = mongoose.model('News', new S({ title: String, body: String }, { timestamps: true }));
const Resource = mongoose.model('Resource', new S({ title: String, kind: String, workshop: String, url: String, shared: { type: Boolean, default: false } }, { timestamps: true }));

const app = express(); app.use(cors(), express.json());
const wrap = f => (req, res) => f(req, res).catch(e => res.status(400).json({ error: e.message }));
const auth = (role) => async (req, res, next) => {
  try { const t = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), JWT_SECRET);
    req.user = await User.findById(t.id); if (!req.user) throw 0;
    if (role && req.user.role !== role) return res.status(403).json({ error: 'Accès refusé' }); next();
  } catch { res.status(401).json({ error: 'Connexion requise' }); } };
const token = u => ({ token: jwt.sign({ id: u.id }, JWT_SECRET, { expiresIn: '7d' }), user: { id: u.id, name: u.name, email: u.email, role: u.role, department: u.department, paid: u.paid } });
const getSettings = async () => (await Settings.findOne()) || Settings.create({ year: new Date().getFullYear() });

app.get('/api/public', wrap(async (_, res) => { const s = await getSettings();
  res.json({ signupOpen: s.signupOpen, year: s.year, announcements: await Announcement.find().sort({ date: 1 }).limit(6) }); }));
app.post('/api/signup', wrap(async (req, res) => { const s = await getSettings();
  if (!s.signupOpen) throw new Error("Les inscriptions sont fermées : elles ouvrent uniquement pendant la journée d'intégration.");
  const { name, email, password, department } = req.body;
  res.json(token(await User.create({ name, email, department, year: s.year, password: await bcrypt.hash(password, 10) }))); }));
app.post('/api/login', wrap(async (req, res) => { const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password, u.password))) throw new Error('Identifiants incorrects'); res.json(token(u)); }));
app.get('/api/me', auth(), (req, res) => res.json(token(req.user).user));
app.get('/api/news', auth(), wrap(async (_, res) => res.json(await News.find().sort({ createdAt: -1 }))));
app.get('/api/resources', auth(), wrap(async (req, res) => res.json(await Resource.find(req.user.role === 'admin' ? {} : { shared: true }).sort({ createdAt: -1 }))));

const A = auth('admin');
app.get('/api/admin/members', A, wrap(async (_, res) => res.json(await User.find({ role: 'member' }).select('-password'))));
app.patch('/api/admin/members/:id', A, wrap(async (req, res) => res.json(await User.findByIdAndUpdate(req.params.id, { paid: !!req.body.paid }, { new: true }).select('-password'))));
app.post('/api/admin/settings', A, wrap(async (req, res) => { const s = await getSettings(); s.signupOpen = !!req.body.signupOpen; await s.save(); res.json(s); }));
app.post('/api/admin/announcements', A, wrap(async (req, res) => res.json(await Announcement.create({ ...req.body, author: req.user.name }))));
app.delete('/api/admin/announcements/:id', A, wrap(async (req, res) => res.json(await Announcement.findByIdAndDelete(req.params.id))));
app.get('/api/admin/chat', A, wrap(async (_, res) => res.json(await Message.find().sort({ createdAt: 1 }).limit(200))));
app.post('/api/admin/chat', A, wrap(async (req, res) => res.json(await Message.create({ author: req.user.name, text: req.body.text }))));
app.post('/api/admin/news', A, wrap(async (req, res) => res.json(await News.create(req.body))));
app.post('/api/admin/resources', A, wrap(async (req, res) => res.json(await Resource.create(req.body))));
app.patch('/api/admin/resources/:id', A, wrap(async (req, res) => res.json(await Resource.findByIdAndUpdate(req.params.id, { shared: !!req.body.shared }, { new: true }))));

await mongoose.connect(MONGO_URL);
if (!(await User.findOne({ role: 'admin' }))) await User.create({ name: 'Admin', email: ADMIN_EMAIL, role: 'admin', paid: true, password: await bcrypt.hash(ADMIN_PASSWORD, 10) });
app.listen(5000, () => console.log('API :5000'));
