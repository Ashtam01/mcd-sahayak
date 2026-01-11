// Internationalization (i18n) system for Sampark
// Supports English and Hindi

export type Language = 'en' | 'hi';

interface Translations {
  // Common
  common: {
    welcome: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    clear: string;
    submit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    viewAll: string;
    select: string;
    all: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    complaints: string;
    analytics: string;
    heatmap: string;
    delhi3d: string;
    broadcast: string;
    schemes: string;
    benefitsRegistry: string;
    settings: string;
  };

  // Landing Page
  landing: {
    title: string;
    subtitle: string;
    getStarted: string;
    call311: string;
    features: {
      title: string;
      subtitle: string;
      voiceFirst: {
        title: string;
        description: string;
      };
      analytics: {
        title: string;
        description: string;
      };
      geographic: {
        title: string;
        description: string;
      };
      automation: {
        title: string;
        description: string;
      };
      sla: {
        title: string;
        description: string;
      };
      multichannel: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
    stats: {
      resolutionRate: string;
      avgResponse: string;
      citizensServed: string;
      available: string;
    };
  };

  // Login Page
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    signIn: string;
    signingIn: string;
    demoCredentials: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    realTimeOverview: string;
    systemOnline: string;
    totalComplaints: string;
    resolvedToday: string;
    avgResolution: string;
    target: string;
    slaCompliance: string;
    escalationRate: string;
    liveAgents: string;
    aiHuman: string;
    liveActivityFeed: string;
    realTime: string;
    noRecentActivity: string;
    viewAllActivity: string;
    aiInsights: string;
    poweredByML: string;
    citizenSentiment: string;
    fromVoiceCalls: string;
    positive: string;
    neutral: string;
    negative: string;
    zonePerformance: string;
    thisWeek: string;
    quickActions: string;
    fullMap: string;
  };

  // Complaints
  complaints: {
    title: string;
    subtitle: string;
    inbox: string;
    manageComplaints: string;
    open: string;
    inProgress: string;
    resolved: string;
    escalated: string;
    status: string;
    category: string;
    region: string;
    searchPlaceholder: string;
    ticketList: string;
    noComplaints: string;
    adjustFilters: string;
    selectComplaint: string;
    location: string;
    citizenInfo: string;
    callDetails: string;
    callDuration: string;
    minRead: string;
    sentiment: string;
    transcript: string;
    aiSummary: string;
    description: string;
    assignedTo: string;
    assignToJE: string;
    markResolved: string;
    whatsappUpdate: string;
    assignedSuccessfully: string;
    markedResolved: string;
    whatsappSent: string;
    assignmentFailed: string;
    updateFailed: string;
  };

  // Zones
  zones: {
    allDelhi: string;
    centralZone: string;
    cityZone: string;
    civilLinesZone: string;
    karolBaghZone: string;
    keshavPuramZone: string;
    najafgarhZone: string;
    narelaZone: string;
    rohiniZone: string;
    shahdaraNorthZone: string;
    shahdaraSouthZone: string;
    southZone: string;
    westZone: string;
  };

  // TopBar
  topBar: {
    selectZone: string;
    searchPlaceholder: string;
    notifications: string;
  };

  // Schemes
  schemes: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    registerNew: string;
    beneficiaries: string;
    grantBenefit: string;
    viewDetails: string;
    active: string;
    paused: string;
  };

  // Analytics
  analytics: {
    title: string;
    subtitle: string;
  };

  // Heatmap
  heatmap: {
    title: string;
    subtitle: string;
  };

  // Broadcast
  broadcast: {
    title: string;
    subtitle: string;
  };

  // Benefits
  benefits: {
    title: string;
    subtitle: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      submit: 'Submit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      viewAll: 'View All',
      select: 'Select',
      all: 'All',
    },
    nav: {
      dashboard: 'Dashboard',
      complaints: 'Complaints',
      analytics: 'Analytics',
      heatmap: 'Heatmap',
      delhi3d: 'Delhi 3D Map',
      broadcast: 'Broadcast',
      schemes: 'Schemes',
      benefitsRegistry: 'Benefits Registry',
      settings: 'Settings',
    },
    landing: {
      title: 'Connecting Citizens with Municipal Services',
      subtitle: 'Streamline complaint resolution with intelligent automation, real-time tracking, and data-driven insights for the Municipal Corporation of Delhi.',
      getStarted: 'Access Admin Panel',
      call311: 'Call 311',
      features: {
        title: 'Powerful Features for Modern Governance',
        subtitle: 'Everything you need to manage civic complaints efficiently and transparently',
        voiceFirst: {
          title: 'Voice-First Interface',
          description: 'AI-powered voice agent handles complaints in Hindi and English, making civic services accessible to all.',
        },
        analytics: {
          title: 'Real-Time Analytics',
          description: 'Comprehensive dashboards with live metrics, trends, and insights to drive data-driven decisions.',
        },
        geographic: {
          title: 'Geographic Intelligence',
          description: 'Interactive heatmaps and zone-based analytics to identify patterns and optimize resource allocation.',
        },
        automation: {
          title: 'AI-Powered Automation',
          description: 'Intelligent routing, sentiment analysis, and automated responses reduce manual workload by 60%.',
        },
        sla: {
          title: 'SLA Management',
          description: 'Automated tracking and alerts ensure timely resolution within defined service level agreements.',
        },
        multichannel: {
          title: 'Multi-Channel Support',
          description: 'Unified platform for voice, SMS, WhatsApp, and web complaints with seamless integration.',
        },
      },
      cta: {
        title: 'Ready to Transform Civic Services?',
        subtitle: 'Join the Municipal Corporation of Delhi in building a more responsive and efficient government.',
        button: 'Get Started Now',
      },
      stats: {
        resolutionRate: 'Resolution Rate',
        avgResponse: 'Avg Response',
        citizensServed: 'Citizens Served',
        available: 'Available',
      },
    },
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to access your admin dashboard',
      email: 'Email Address',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      demoCredentials: 'Demo credentials:',
      emailPlaceholder: 'admin@mcd.gov.in',
      passwordPlaceholder: 'Enter your password',
    },
    dashboard: {
      title: 'Command Center',
      subtitle: 'Real-time overview for',
      realTimeOverview: 'Real-time overview',
      systemOnline: 'System Online',
      totalComplaints: 'Total Complaints',
      resolvedToday: 'Resolved Today',
      avgResolution: 'Avg Resolution',
      target: 'Target: 24h',
      slaCompliance: 'SLA Compliance',
      escalationRate: 'Escalation Rate',
      liveAgents: 'Live Agents',
      aiHuman: 'AI + Human',
      liveActivityFeed: 'Live Activity Feed',
      realTime: 'Real-time',
      noRecentActivity: 'No recent activity',
      viewAllActivity: 'View All Activity',
      aiInsights: 'AI Insights',
      poweredByML: 'Powered by ML',
      citizenSentiment: 'Citizen Sentiment',
      fromVoiceCalls: 'From Voice Calls',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
      zonePerformance: 'Zone Performance',
      thisWeek: 'This Week',
      quickActions: 'Quick Actions',
      fullMap: 'Full Map',
    },
    complaints: {
      title: 'Complaints Inbox',
      subtitle: 'Manage and respond to citizen complaints efficiently',
      inbox: 'Complaints Inbox',
      manageComplaints: 'Manage and respond to citizen complaints',
      open: 'Open',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      escalated: 'Escalated',
      status: 'Status',
      category: 'Category',
      region: 'Region/Zone',
      searchPlaceholder: 'Search ID, location, category...',
      ticketList: 'Ticket List',
      noComplaints: 'No complaints found',
      adjustFilters: 'Try adjusting your filters',
      selectComplaint: 'Select a complaint to view details',
      location: 'Location',
      citizenInfo: 'Citizen Information',
      callDetails: 'Call Details',
      callDuration: 'Call Duration',
      minRead: 'Min Read',
      sentiment: 'Sentiment',
      transcript: 'Call Transcript',
      aiSummary: 'AI Issue Summary',
      description: 'Description',
      assignedTo: 'Assigned To',
      assignToJE: 'Assign to JE',
      markResolved: 'Mark Resolved',
      whatsappUpdate: 'WhatsApp Update',
      assignedSuccessfully: 'Assigned Successfully',
      markedResolved: 'Marked as Resolved',
      whatsappSent: 'WhatsApp Update Sent',
      assignmentFailed: 'Assignment Failed',
      updateFailed: 'Update Failed',
    },
    zones: {
      allDelhi: 'All Delhi HQ',
      centralZone: 'Central Zone',
      cityZone: 'City Zone',
      civilLinesZone: 'Civil Lines Zone',
      karolBaghZone: 'Karol Bagh Zone',
      keshavPuramZone: 'Keshav Puram Zone',
      najafgarhZone: 'Najafgarh Zone',
      narelaZone: 'Narela Zone',
      rohiniZone: 'Rohini Zone',
      shahdaraNorthZone: 'Shahdara North Zone',
      shahdaraSouthZone: 'Shahdara South Zone',
      southZone: 'South Zone',
      westZone: 'West Zone',
    },
    topBar: {
      selectZone: 'Select Zone',
      searchPlaceholder: 'Search complaints, tickets, citizens...',
      notifications: 'Notifications',
    },
    schemes: {
      title: 'Active Schemes Registry',
      subtitle: 'Manage public welfare schemes available to citizens',
      searchPlaceholder: 'Search schemes by name or category...',
      registerNew: 'Register New Scheme',
      beneficiaries: 'Beneficiaries',
      grantBenefit: 'Grant/Benefit',
      viewDetails: 'View Details',
      active: 'Active',
      paused: 'Paused',
    },
    analytics: {
      title: 'Analytics Dashboard',
      subtitle: 'Comprehensive insights and data visualization',
    },
    heatmap: {
      title: 'Geographic Heatmap',
      subtitle: 'Visualize complaint distribution across zones',
    },
    broadcast: {
      title: 'Broadcast Messages',
      subtitle: 'Send announcements and updates to citizens',
    },
    benefits: {
      title: 'Benefits Registry',
      subtitle: 'Manage citizen benefits and entitlements',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure system preferences and options',
    },
  },
  hi: {
    common: {
      welcome: 'स्वागत है',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      clear: 'साफ़ करें',
      submit: 'जमा करें',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      viewAll: 'सभी देखें',
      select: 'चुनें',
      all: 'सभी',
    },
    nav: {
      dashboard: 'डैशबोर्ड',
      complaints: 'शिकायतें',
      analytics: 'विश्लेषण',
      heatmap: 'हीटमैप',
      delhi3d: 'दिल्ली 3D मानचित्र',
      broadcast: 'प्रसारण',
      schemes: 'योजनाएं',
      benefitsRegistry: 'लाभ रजिस्ट्री',
      settings: 'सेटिंग्स',
    },
    landing: {
      title: 'नागरिकों को नगर निगम सेवाओं से जोड़ना',
      subtitle: 'दिल्ली नगर निगम के लिए बुद्धिमान स्वचालन, वास्तविक समय ट्रैकिंग और डेटा-संचालित अंतर्दृष्टि के साथ शिकायत समाधान को सुव्यवस्थित करें।',
      getStarted: 'एडमिन पैनल एक्सेस करें',
      call311: '311 पर कॉल करें',
      features: {
        title: 'आधुनिक शासन के लिए शक्तिशाली सुविधाएं',
        subtitle: 'नागरिक शिकायतों को कुशलतापूर्वक और पारदर्शी रूप से प्रबंधित करने के लिए आपको जो कुछ चाहिए',
        voiceFirst: {
          title: 'वॉइस-फर्स्ट इंटरफेस',
          description: 'AI-संचालित वॉइस एजेंट हिंदी और अंग्रेजी में शिकायतों को संभालता है, जिससे नागरिक सेवाएं सभी के लिए सुलभ हो जाती हैं।',
        },
        analytics: {
          title: 'वास्तविक समय विश्लेषण',
          description: 'डेटा-संचालित निर्णय लेने के लिए लाइव मेट्रिक्स, रुझान और अंतर्दृष्टि के साथ व्यापक डैशबोर्ड।',
        },
        geographic: {
          title: 'भौगोलिक बुद्धिमत्ता',
          description: 'पैटर्न की पहचान करने और संसाधन आवंटन को अनुकूलित करने के लिए इंटरैक्टिव हीटमैप और ज़ोन-आधारित विश्लेषण।',
        },
        automation: {
          title: 'AI-संचालित स्वचालन',
          description: 'बुद्धिमान रूटिंग, भावना विश्लेषण और स्वचालित प्रतिक्रियाएं मैनुअल कार्यभार को 60% तक कम करती हैं।',
        },
        sla: {
          title: 'SLA प्रबंधन',
          description: 'स्वचालित ट्रैकिंग और अलर्ट परिभाषित सेवा स्तर समझौतों के भीतर समय पर समाधान सुनिश्चित करते हैं।',
        },
        multichannel: {
          title: 'मल्टी-चैनल सपोर्ट',
          description: 'वॉइस, SMS, WhatsApp और वेब शिकायतों के लिए निर्बाध एकीकरण के साथ एकीकृत प्लेटफॉर्म।',
        },
      },
      cta: {
        title: 'नागरिक सेवाओं को बदलने के लिए तैयार हैं?',
        subtitle: 'दिल्ली नगर निगम में एक अधिक उत्तरदायी और कुशल सरकार बनाने में शामिल हों।',
        button: 'अभी शुरू करें',
      },
      stats: {
        resolutionRate: 'समाधान दर',
        avgResponse: 'औसत प्रतिक्रिया',
        citizensServed: 'नागरिक सेवित',
        available: 'उपलब्ध',
      },
    },
    login: {
      title: 'वापसी पर स्वागत है',
      subtitle: 'अपने एडमिन डैशबोर्ड तक पहुंचने के लिए साइन इन करें',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      rememberMe: 'मुझे याद रखें',
      forgotPassword: 'पासवर्ड भूल गए?',
      signIn: 'साइन इन करें',
      signingIn: 'साइन इन हो रहा है...',
      demoCredentials: 'डेमो क्रेडेंशियल:',
      emailPlaceholder: 'admin@mcd.gov.in',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    },
    dashboard: {
      title: 'कमांड सेंटर',
      subtitle: 'के लिए वास्तविक समय अवलोकन',
      realTimeOverview: 'वास्तविक समय अवलोकन',
      systemOnline: 'सिस्टम ऑनलाइन',
      totalComplaints: 'कुल शिकायतें',
      resolvedToday: 'आज हल हुई',
      avgResolution: 'औसत समाधान',
      target: 'लक्ष्य: 24 घंटे',
      slaCompliance: 'SLA अनुपालन',
      escalationRate: 'एस्केलेशन दर',
      liveAgents: 'लाइव एजेंट',
      aiHuman: 'AI + मानव',
      liveActivityFeed: 'लाइव गतिविधि फीड',
      realTime: 'वास्तविक समय',
      noRecentActivity: 'कोई हाल की गतिविधि नहीं',
      viewAllActivity: 'सभी गतिविधि देखें',
      aiInsights: 'AI अंतर्दृष्टि',
      poweredByML: 'ML द्वारा संचालित',
      citizenSentiment: 'नागरिक भावना',
      fromVoiceCalls: 'वॉइस कॉल से',
      positive: 'सकारात्मक',
      neutral: 'तटस्थ',
      negative: 'नकारात्मक',
      zonePerformance: 'ज़ोन प्रदर्शन',
      thisWeek: 'इस सप्ताह',
      quickActions: 'त्वरित कार्रवाई',
      fullMap: 'पूरा नक्शा',
    },
    complaints: {
      title: 'शिकायत इनबॉक्स',
      subtitle: 'नागरिक शिकायतों को कुशलतापूर्वक प्रबंधित और प्रतिक्रिया दें',
      inbox: 'शिकायत इनबॉक्स',
      manageComplaints: 'नागरिक शिकायतों को प्रबंधित और प्रतिक्रिया दें',
      open: 'खुला',
      inProgress: 'प्रगति में',
      resolved: 'हल',
      escalated: 'एस्केलेटेड',
      status: 'स्थिति',
      category: 'श्रेणी',
      region: 'क्षेत्र/ज़ोन',
      searchPlaceholder: 'ID, स्थान, श्रेणी खोजें...',
      ticketList: 'टिकट सूची',
      noComplaints: 'कोई शिकायत नहीं मिली',
      adjustFilters: 'अपने फ़िल्टर समायोजित करने का प्रयास करें',
      selectComplaint: 'विवरण देखने के लिए एक शिकायत चुनें',
      location: 'स्थान',
      citizenInfo: 'नागरिक जानकारी',
      callDetails: 'कॉल विवरण',
      callDuration: 'कॉल अवधि',
      minRead: 'मिनट पढ़ें',
      sentiment: 'भावना',
      transcript: 'कॉल ट्रांसक्रिप्ट',
      aiSummary: 'AI समस्या सारांश',
      description: 'विवरण',
      assignedTo: 'असाइन किया गया',
      assignToJE: 'JE को असाइन करें',
      markResolved: 'हल के रूप में चिह्नित करें',
      whatsappUpdate: 'WhatsApp अपडेट',
      assignedSuccessfully: 'सफलतापूर्वक असाइन किया गया',
      markedResolved: 'हल के रूप में चिह्नित किया गया',
      whatsappSent: 'WhatsApp अपडेट भेजा गया',
      assignmentFailed: 'असाइनमेंट विफल',
      updateFailed: 'अपडेट विफल',
    },
    zones: {
      allDelhi: 'सभी दिल्ली मुख्यालय',
      centralZone: 'सेंट्रल ज़ोन',
      cityZone: 'सिटी ज़ोन',
      civilLinesZone: 'सिविल लाइन्स ज़ोन',
      karolBaghZone: 'करोल बाग ज़ोन',
      keshavPuramZone: 'केशव पुरम ज़ोन',
      najafgarhZone: 'नजफगढ़ ज़ोन',
      narelaZone: 'नरेला ज़ोन',
      rohiniZone: 'रोहिणी ज़ोन',
      shahdaraNorthZone: 'शाहदरा उत्तर ज़ोन',
      shahdaraSouthZone: 'शाहदरा दक्षिण ज़ोन',
      southZone: 'साउथ ज़ोन',
      westZone: 'वेस्ट ज़ोन',
    },
    topBar: {
      selectZone: 'ज़ोन चुनें',
      searchPlaceholder: 'शिकायतें, टिकट, नागरिक खोजें...',
      notifications: 'सूचनाएं',
    },
    schemes: {
      title: 'सक्रिय योजना रजिस्ट्री',
      subtitle: 'नागरिकों के लिए उपलब्ध सार्वजनिक कल्याण योजनाओं को प्रबंधित करें',
      searchPlaceholder: 'नाम या श्रेणी से योजनाएं खोजें...',
      registerNew: 'नई योजना पंजीकृत करें',
      beneficiaries: 'लाभार्थी',
      grantBenefit: 'अनुदान/लाभ',
      viewDetails: 'विवरण देखें',
      active: 'सक्रिय',
      paused: 'रोका गया',
    },
    analytics: {
      title: 'विश्लेषण डैशबोर्ड',
      subtitle: 'व्यापक अंतर्दृष्टि और डेटा विज़ुअलाइज़ेशन',
    },
    heatmap: {
      title: 'भौगोलिक हीटमैप',
      subtitle: 'ज़ोन में शिकायत वितरण की कल्पना करें',
    },
    broadcast: {
      title: 'प्रसारण संदेश',
      subtitle: 'नागरिकों को घोषणाएं और अपडेट भेजें',
    },
    benefits: {
      title: 'लाभ रजिस्ट्री',
      subtitle: 'नागरिक लाभ और अधिकारों को प्रबंधित करें',
    },
    settings: {
      title: 'सेटिंग्स',
      subtitle: 'सिस्टम प्राथमिकताएं और विकल्प कॉन्फ़िगर करें',
    },
  },
};

// Language store
let currentLanguage: Language = 'en';

// Get current language
export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('sampark-language') as Language;
    if (stored && (stored === 'en' || stored === 'hi')) {
      currentLanguage = stored;
      return stored;
    }
  }
  return currentLanguage;
}

// Set language
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sampark-language', lang);
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));
  }
}

// Get translations for current language
export function t(): Translations {
  const lang = getLanguage();
  return translations[lang];
}

export { translations };
export type { Translations };
