export type Locale = "en" | "zh" | "vi" | "ar";

export const SUPPORTED_LOCALES: { code: Locale; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "中文" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

type TranslationKeys = {
  "nav.dashboard": string;
  "nav.documents": string;
  "nav.contacts": string;
  "nav.checklist": string;
  "nav.directory": string;
  "nav.digital": string;
  "nav.messages": string;
  "nav.settings": string;
  "dashboard.welcome": string;
  "dashboard.progress": string;
  "dashboard.nextStep": string;
  "vault.title": string;
  "vault.upload": string;
  "vault.empty": string;
  "checklist.title": string;
  "checklist.noRush": string;
  "contacts.title": string;
  "contacts.add": string;
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.loading": string;
  "common.search": string;
};

const translations: Record<Locale, TranslationKeys> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.documents": "My Documents",
    "nav.contacts": "Trusted People",
    "nav.checklist": "Checklists",
    "nav.directory": "Key Contacts",
    "nav.digital": "Online Accounts",
    "nav.messages": "Messages",
    "nav.settings": "Settings",
    "dashboard.welcome": "Welcome",
    "dashboard.progress": "Great progress!",
    "dashboard.nextStep": "Your next step",
    "vault.title": "Your Documents",
    "vault.upload": "Upload Document",
    "vault.empty": "Ready to add your first document?",
    "checklist.title": "Your Checklists",
    "checklist.noRush": "Grouped into sections so you can focus on one area at a time. No rush.",
    "contacts.title": "Trusted People",
    "contacts.add": "Add Trusted Person",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.search": "Search",
  },
  zh: {
    "nav.dashboard": "仪表板",
    "nav.documents": "我的文件",
    "nav.contacts": "信任的人",
    "nav.checklist": "检查清单",
    "nav.directory": "重要联系人",
    "nav.digital": "在线账户",
    "nav.messages": "留言",
    "nav.settings": "设置",
    "dashboard.welcome": "欢迎",
    "dashboard.progress": "进展很好！",
    "dashboard.nextStep": "下一步",
    "vault.title": "您的文件",
    "vault.upload": "上传文件",
    "vault.empty": "准备添加您的第一份文件？",
    "checklist.title": "您的检查清单",
    "checklist.noRush": "按类别分组，方便您一次专注一个部分。不着急。",
    "contacts.title": "信任的人",
    "contacts.add": "添加信任的人",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.loading": "加载中...",
    "common.search": "搜索",
  },
  vi: {
    "nav.dashboard": "Bảng điều khiển",
    "nav.documents": "Tài liệu",
    "nav.contacts": "Người tin tưởng",
    "nav.checklist": "Danh sách",
    "nav.directory": "Liên hệ quan trọng",
    "nav.digital": "Tài khoản trực tuyến",
    "nav.messages": "Tin nhắn",
    "nav.settings": "Cài đặt",
    "dashboard.welcome": "Chào mừng",
    "dashboard.progress": "Tiến bộ tốt!",
    "dashboard.nextStep": "Bước tiếp theo",
    "vault.title": "Tài liệu của bạn",
    "vault.upload": "Tải lên tài liệu",
    "vault.empty": "Sẵn sàng thêm tài liệu đầu tiên?",
    "checklist.title": "Danh sách của bạn",
    "checklist.noRush": "Được nhóm theo phần để bạn tập trung từng mục. Không vội.",
    "contacts.title": "Người tin tưởng",
    "contacts.add": "Thêm người tin tưởng",
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.delete": "Xóa",
    "common.loading": "Đang tải...",
    "common.search": "Tìm kiếm",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.documents": "مستنداتي",
    "nav.contacts": "الأشخاص الموثوقون",
    "nav.checklist": "قوائم المراجعة",
    "nav.directory": "جهات الاتصال المهمة",
    "nav.digital": "الحسابات الإلكترونية",
    "nav.messages": "الرسائل",
    "nav.settings": "الإعدادات",
    "dashboard.welcome": "مرحباً",
    "dashboard.progress": "تقدم رائع!",
    "dashboard.nextStep": "خطوتك التالية",
    "vault.title": "مستنداتك",
    "vault.upload": "رفع مستند",
    "vault.empty": "هل أنت مستعد لإضافة أول مستند؟",
    "checklist.title": "قوائم المراجعة",
    "checklist.noRush": "مجموعة في أقسام حتى تتمكن من التركيز على منطقة واحدة في كل مرة.",
    "contacts.title": "الأشخاص الموثوقون",
    "contacts.add": "إضافة شخص موثوق",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.loading": "جاري التحميل...",
    "common.search": "بحث",
  },
};

export function t(key: keyof TranslationKeys, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
