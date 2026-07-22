import { User, Product, Order, AdminStats } from "./types";

// ── Users ──────────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Selam Tadesse",
    username: "selam.tadesse",
    email: "selam.tadesse@university.edu.et",
    bio: "Final-year Computer Science student at AAU. I sell condensed notes and annotated past papers for CS and Maths modules.",
    avatar: "https://i.pravatar.cc/150?img=47",
    role: "student",
    isVerified: true,
    memberSince: "September 2023",
  },
  {
    id: "u2",
    name: "Biruk Haile",
    username: "biruk.haile",
    email: "b.haile@university.edu.et",
    bio: "Engineering student specialising in Thermodynamics at EiABC. Sharing my lecture notes and problem sets from years 2 & 3.",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "student",
    isVerified: true,
    memberSince: "January 2024",
  },
  {
    id: "u3",
    name: "Hiwot Bekele",
    username: "hiwot.bekele",
    email: "h.bekele@university.edu.et",
    bio: "Law student at AAU. Selling detailed case summaries and tutorial prep guides for LLB modules.",
    avatar: "https://i.pravatar.cc/150?img=25",
    role: "student",
    isVerified: false,
    memberSince: "March 2024",
  },
  {
    id: "admin1",
    name: "Dawit Girma",
    username: "admin",
    email: "admin@campusly.app",
    bio: "Campusly platform administrator.",
    avatar: "https://i.pravatar.cc/150?img=60",
    role: "admin",
    isVerified: true,
    memberSince: "January 2023",
  },
];

// ── Products ───────────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Complete Data Structures & Algorithms Notes — CS301",
    price: 1200,
    description:
      "Comprehensive handwritten-then-typed notes covering the full CS301 curriculum: arrays, linked lists, trees, graphs, heaps, sorting algorithms, dynamic programming, and complexity analysis. Includes annotated diagrams for every major data structure and worked examples for all algorithm types covered in the course.\n\nCovers weeks 1–12 of CS301 as taught at UCT. Aligned with Cormen et al. (CLRS) 4th edition. Includes past exam problem walkthroughs for 2022 and 2023 papers, with step-by-step solutions.\n\nIdeal for students preparing for the final exam or catching up on missed lectures.",
    category: "Computer Science",
    productType: "notes",
    images: [
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    ],
    seller: MOCK_USERS[0],
    status: "approved",
    createdAt: "2024-05-10",
    isFeatured: true,
  },
  {
    id: "p2",
    title: "Thermodynamics II — Full Lecture Notes (Weeks 1–8)",
    description:
      "Detailed notes for the full first half of Thermodynamics II, covering the laws of thermodynamics, entropy, Carnot cycles, Rankine cycles, refrigeration cycles, and combustion thermodynamics. Includes annotated problem sets from every tutorial session.\n\nAll problems include full worked solutions. Notes are typed and structured for clarity, not raw scan quality.",
    price: 950,
    category: "Engineering",
    productType: "notes",
    images: [
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    ],
    seller: MOCK_USERS[1],
    status: "approved",
    createdAt: "2024-05-08",
    isFeatured: false,
  },
  {
    id: "p3",
    title: "LLB Contract Law — Past Exam Papers 2019–2023 (5 Years)",
    description:
      "Complete set of Contract Law past exam papers from 2019 through 2023, with model answers prepared from lecturer feedback and tutorial discussions. Each paper includes commentary on common mistakes and marking criteria.\n\nCovers offer & acceptance, consideration, misrepresentation, breach, and remedies. Includes essay question guides and case citation lists.",
    price: 1500,
    category: "Law",
    productType: "past-exam",
    images: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
    ],
    seller: MOCK_USERS[2],
    status: "approved",
    createdAt: "2024-05-12",
    isFeatured: true,
  },
  {
    id: "p4",
    title: "Business Strategy Module — Complete Study Guide",
    description:
      "End-to-end study guide for the Business Strategy core module. Covers Porter's Five Forces, SWOT analysis, BCG matrix, value chain analysis, competitive advantage, blue ocean strategy, and strategic implementation frameworks.\n\nIncludes 12 detailed case study summaries from the prescribed textbook, plus exam technique notes.",
    price: 800,
    category: "Business",
    productType: "module",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    ],
    seller: MOCK_USERS[0],
    status: "approved",
    createdAt: "2024-05-06",
    isFeatured: false,
  },
  {
    id: "p5",
    title: "Introduction to Machine Learning — Video Lecture Series (10 hrs)",
    description:
      "Recorded video lecture series covering the foundational machine learning curriculum: supervised vs unsupervised learning, linear and logistic regression, decision trees, random forests, SVMs, neural network basics, and model evaluation. Ten hours of content, broken into 45–60 minute episodes.\n\nFilmed during live tutorials. Includes code demos in Python (scikit-learn and PyTorch).",
    price: 2000,
    category: "Computer Science",
    productType: "video-lecture",
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    ],
    seller: MOCK_USERS[0],
    status: "approved",
    createdAt: "2024-05-15",
    isFeatured: true,
  },
  {
    id: "p6",
    title: "Anatomy & Physiology I — Complete Illustrated Notes",
    description:
      "Beautifully illustrated notes for A&P I, covering the musculoskeletal system, cardiovascular system, respiratory system, and nervous system. All diagrams are fully labelled and colour-coded for exam readability.\n\nCross-referenced with Moore's Clinically Oriented Anatomy and Guyton & Hall.",
    price: 1100,
    category: "Medicine",
    productType: "notes",
    images: [
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    ],
    seller: MOCK_USERS[1],
    status: "pending",
    createdAt: "2024-05-17",
    isFeatured: false,
  },
  {
    id: "p7",
    title: "Corporate Law Past Papers 2020–2023",
    description:
      "Four years of Corporate Law past exam papers with model answers. Covers company formation, directors' duties, shareholder rights, mergers & acquisitions, and insolvency law.",
    price: 1300,
    category: "Law",
    productType: "past-exam",
    images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    ],
    seller: MOCK_USERS[2],
    status: "rejected",
    createdAt: "2024-05-03",
    rejectionReason:
      "The listing description does not clearly indicate the source of model answers. Please clarify whether these are official marking schemes or student-prepared solutions.",
  },
  {
    id: "p8",
    title: "Linear Algebra — Full Module Notes & Problem Sets",
    description:
      "Complete typed notes for the Linear Algebra module. Covers vectors, matrices, determinants, eigenvalues and eigenvectors, linear transformations, and vector spaces. Every theorem is stated, proved, and illustrated with worked examples.",
    price: 850,
    category: "Mathematics",
    productType: "module",
    images: [
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    ],
    seller: MOCK_USERS[1],
    status: "approved",
    createdAt: "2024-05-01",
    isFeatured: false,
  },
  {
    id: "p9",
    title: "Financial Accounting — Exam Prep Bundle",
    description:
      "Comprehensive exam prep bundle for Financial Accounting: summarised theory notes, ratio analysis cheat sheet, past papers (2021–2023), and worked trial balance exercises. Covers IFRS standards and local GAAP differences.",
    price: 990,
    category: "Business",
    productType: "module",
    images: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    ],
    seller: MOCK_USERS[0],
    status: "approved",
    createdAt: "2024-04-28",
    isFeatured: false,
  },
  {
    id: "p10",
    title: "Civil Engineering Mechanics — Video Summaries",
    description:
      "Short-form video summaries (10–20 min each) for Engineering Mechanics topics: statics, dynamics, stress and strain, beam bending, and torsion. Designed for quick revision before exams.",
    price: 1600,
    category: "Engineering",
    productType: "video-lecture",
    images: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
    ],
    seller: MOCK_USERS[1],
    status: "pending",
    createdAt: "2024-05-18",
    isFeatured: false,
  },
  {
    id: "p11",
    title: "Art History Survey — Renaissance to Modern",
    description:
      "Detailed study guide covering major movements from the Italian Renaissance through to 20th-century modernism. Includes artist biographies, key works with analysis, timeline charts, and common exam essay structures.",
    price: 700,
    category: "Arts & Humanities",
    productType: "notes",
    images: [
      "https://images.unsplash.com/photo-1544511916-0148cfef79b7?w=800&q=80",
    ],
    seller: MOCK_USERS[2],
    status: "approved",
    createdAt: "2024-04-20",
    isFeatured: false,
  },
  {
    id: "p12",
    title: "Microbiology Past Papers — 3 Years with Answers",
    description:
      "Past exam papers for Introductory Microbiology covering bacteriology, virology, mycology, and parasitology. Three complete exam papers (2021, 2022, 2023) with structured model answers.",
    price: 900,
    category: "Natural Sciences",
    productType: "past-exam",
    images: [
      "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?w=800&q=80",
    ],
    seller: MOCK_USERS[0],
    status: "approved",
    createdAt: "2024-05-05",
    isFeatured: false,
  },
];

// ── Admin Stats ────────────────────────────────────────────────────────────────
export const MOCK_ADMIN_STATS: AdminStats = {
  totalListings: 47,
  activeUsers: 312,
  pendingReview: 3,
  flaggedReported: 2,
};

// ── Orders ─────────────────────────────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    product: MOCK_PRODUCTS[0],
    buyer: MOCK_USERS[1],
    createdAt: "2024-05-11",
    status: "completed",
  },
  {
    id: "o2",
    product: MOCK_PRODUCTS[2],
    buyer: MOCK_USERS[0],
    createdAt: "2024-05-13",
    status: "completed",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Computer Science",
  "Mathematics",
  "Arts & Humanities",
  "Natural Sciences",
] as const;

export const PRODUCT_TYPES = [
  { value: "module", label: "Modules" },
  { value: "notes", label: "Lecture Notes" },
  { value: "past-exam", label: "Past Exam Papers" },
  { value: "video-lecture", label: "Video Lectures" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;
