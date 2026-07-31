import {
  ArrowRight,
  Award,
  BookCheck,
  BookOpen,
  Bookmark,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Clock3,
  Compass,
  ExternalLink,
  FileCheck2,
  Files,
  Flame,
  GraduationCap,
  House,
  Languages,
  LibraryBig,
  ListChecks,
  NotebookPen,
  Search,
  Sparkles,
  Target,
  Timer,
  Trophy,
  createIcons,
} from "lucide";

const ICONS = {
  ArrowRight,
  Award,
  BookCheck,
  BookOpen,
  Bookmark,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Clock3,
  Compass,
  ExternalLink,
  FileCheck2,
  Files,
  Flame,
  GraduationCap,
  House,
  Languages,
  LibraryBig,
  ListChecks,
  NotebookPen,
  Search,
  Sparkles,
  Target,
  Timer,
  Trophy,
};

export function icon(name, className = "") {
  return `<i data-lucide="${name}" class="app-icon ${className}" aria-hidden="true"></i>`;
}

export function hydrateIcons(root = document) {
  createIcons({
    icons: ICONS,
    attrs: {
      "stroke-width": 1.9,
    },
  });

  root.querySelectorAll("svg.app-icon").forEach((svg) => {
    svg.setAttribute("focusable", "false");
  });
}
