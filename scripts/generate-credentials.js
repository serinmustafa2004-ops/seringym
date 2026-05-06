const fs = require("fs");
const path = require("path");
const bcrypt = require("../backend/node_modules/bcryptjs");

const root = path.resolve(__dirname, "..");

const admin = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Admin Kullanıcı",
    email: "admin@serinlocal",
    username: "admin.serin",
    password: "SerinAdm01!",
    role: "Yönetici"
  }
];

const trainers = [
  ["33333333-3333-3333-3333-333333333333", "Mert Yıldız", "mert@serinlocal", "mert.yildiz", "SerinAnt01!"],
  ["44444444-4444-4444-4444-444444444444", "Selin Aras", "selin@serinlocal", "selin.aras", "SerinAnt02!"],
  ["55554444-4444-4444-4444-444444444444", "Deniz Aksoy", "deniz@gympro.local", "deniz.aksoy", "SerinAnt03!"],
  ["66665555-5555-5555-5555-555555555555", "Buse Çetin", "buse@gympro.local", "buse.cetin", "SerinAnt04!"],
  ["99990000-0000-0000-0000-000000000001", "Can Gür", "can.gur@seringym.local", "can.gur", "SerinAnt05!"],
  ["99990000-0000-0000-0000-000000000002", "Eda Yurt", "eda.yurt@seringym.local", "eda.yurt", "SerinAnt06!"],
  ["99990000-0000-0000-0000-000000000003", "Oğuz Mert", "oguz.mert@seringym.local", "oguz.mert", "SerinAnt07!"],
  ["99990000-0000-0000-0000-000000000004", "İpek Çınar", "ipek.cinar@seringym.local", "ipek.cinar", "SerinAnt08!"]
].map(([id, name, email, username, password]) => ({
  id,
  name,
  email,
  username,
  password,
  role: "Antrenör"
}));

const memberNames1to49 = [
  "Ahmet Yılmaz", "Ayşe Kaya", "Mehmet Demir", "Fatma Şahin", "Ali Çelik", "Zeynep Arslan", "Mustafa Koç", "Elif Aydın", "Hasan Kurt", "Merve Polat",
  "Emre Yıldırım", "Seda Öztürk", "Burak Karaca", "Ebru Avcı", "Onur Kılıç", "Cansu Eren", "Hakan Aslan", "Tuğçe Güneş", "Kaan Bulut", "Büşra Akın",
  "Serkan Taş", "Gizem Çetin", "Tolga Özdemir", "Derya Tekin", "Uğur Korkmaz", "İrem Karataş", "Barış Şimşek", "Pelin Can", "Furkan Yıldız", "Nazlı Ersoy",
  "Murat Doğan", "Yasemin Sezer", "Kerem Acar", "Aslı Nur", "Volkan Ateş", "Hande Çalışkan", "Caner Özkan", "Sinem Yalçın", "Deniz Uçar", "Esra Toprak",
  "Okan Keskin", "Nisa Çakır", "Arda Tunç", "Melis Yurt", "Eren Kaplan", "Selin Korkut", "Bora Yüce", "İlayda Duman", "Batuhan Soylu"
];

const firstNames = [
  "Ahmet", "Ayşe", "Mehmet", "Fatma", "Ali", "Zeynep", "Mustafa", "Elif", "Hasan", "Merve",
  "Emre", "Seda", "Burak", "Ebru", "Onur", "Cansu", "Hakan", "Tuğçe", "Kaan", "Büşra",
  "Serkan", "Gizem", "Tolga", "Derya", "Uğur", "İrem", "Barış", "Pelin", "Furkan", "Nazlı",
  "Murat", "Yasemin", "Kerem", "Aslı", "Volkan", "Hande", "Caner", "Sinem", "Deniz", "Esra"
];

const lastNames = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Arslan", "Koç", "Aydın", "Kurt", "Polat",
  "Yıldırım", "Öztürk", "Karaca", "Avcı", "Kılıç", "Eren", "Aslan", "Güneş", "Bulut", "Akın",
  "Taş", "Çetin", "Özdemir", "Tekin", "Korkmaz", "Karataş", "Şimşek", "Can", "Doğan", "Sezer",
  "Acar", "Toprak", "Ateş", "Çalışkan", "Özkan", "Yalçın", "Uçar", "Kaplan", "Yüce", "Duman"
];

const members = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Ece Kaya",
    email: "ece@serinlocal",
    username: "uye001",
    password: "SerinUye001!",
    role: "Üye"
  }
];

const usedMemberNames = new Set(members.map((member) => member.name));

function uniqueMemberName(index) {
  if (index < memberNames1to49.length) {
    const directName = memberNames1to49[index];
    usedMemberNames.add(directName);
    return directName;
  }

  let attempt = index;
  while (attempt < firstNames.length * lastNames.length + index + 20) {
    const first = firstNames[attempt % firstNames.length];
    const last = lastNames[Math.floor(attempt / firstNames.length) % lastNames.length];
    const candidate = `${first} ${last}`;

    if (!usedMemberNames.has(candidate)) {
      usedMemberNames.add(candidate);
      return candidate;
    }

    attempt += 1;
  }

  const fallback = `Üye ${String(index + 1).padStart(3, "0")}`;
  usedMemberNames.add(fallback);
  return fallback;
}

for (let i = 1; i <= 49; i += 1) {
  const no = String(i + 1).padStart(3, "0");
  members.push({
    id: `90000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
    name: uniqueMemberName(i - 1),
    email: `uye${i}@seringym.local`,
    username: `uye${no}`,
    password: `SerinUye${no}!`,
    role: "Üye"
  });
}

for (let gs = 50; gs <= 249; gs += 1) {
  const no = String(gs + 1).padStart(3, "0");
  members.push({
    id: `93000000-0000-0000-0000-${String(gs).padStart(12, "0")}`,
    name: uniqueMemberName(gs - 1),
    email: `uye${gs}@seringym.local`,
    username: `uye${no}`,
    password: `SerinUye${no}!`,
    role: "Üye"
  });
}

const accounts = [...admin, ...trainers, ...members];

const sqlLines = [
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(80);",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;",
  ""
];

const renameLines = [];

for (const account of accounts) {
  const hash = bcrypt.hashSync(account.password, 10);
  const escapedUsername = account.username.replace(/'/g, "''");
  sqlLines.push(
    `UPDATE users SET username = '${escapedUsername}', password_hash = '${hash}' WHERE id = '${account.id}';`
  );

  if (account.role === "Üye") {
    const escapedName = account.name.replace(/'/g, "''");
    renameLines.push(`UPDATE users SET full_name = '${escapedName}' WHERE id = '${account.id}';`);
  }
}

const markdown = [
  "# Kullanıcı Adları ve Şifreler",
  "",
  "Bu dosyada SerinGym örnek hesaplarının giriş bilgileri yer alır.",
  "Giriş ekranındaki `Kullanıcı Adı veya E-posta` alanına kullanıcı adını yazman yeterlidir.",
  ""
];

function appendSection(title, items) {
  markdown.push(`## ${title}`);
  markdown.push("");
  markdown.push("| Ad Soyad | Rol | Kullanıcı Adı | Şifre | E-posta |");
  markdown.push("|---|---|---|---|---|");
  for (const item of items) {
    markdown.push(`| ${item.name} | ${item.role} | ${item.username} | ${item.password} | ${item.email} |`);
  }
  markdown.push("");
}

appendSection("Yönetici", admin);
appendSection("Antrenörler", trainers);
appendSection("Üyeler", members);

fs.writeFileSync(path.join(root, "database", "migration_v11.sql"), sqlLines.join("\n") + "\n");
fs.writeFileSync(path.join(root, "database", "migration_v14.sql"), renameLines.join("\n") + "\n");
fs.writeFileSync(path.join(root, "kullanıcı adları ve şifreler.md"), markdown.join("\n"));

console.log(`Hazırlandı: ${accounts.length} hesap`);
