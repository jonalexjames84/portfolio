import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Link,
} from "@react-pdf/renderer";
import { skillCategories } from "@/lib/experience";

// Resume-specific role data, concise, results-driven bullets separate from the website
// Primary roles: the 6 that tell the career story
const resumeRoles = [
  {
    company: "Frame Story",
    title: "Co-Founder & Director of Product",
    period: "2025 – Present",
    highlights: [
      "Co-founded collaborative game studio: LLC formation, contributor agreements, IP assignment, 5-year financial model, and investor pitch deck",
      "Designed phased GTM (Steam Next Fest, indie festivals, Kickstarter) and multi-track fundraising strategy ($100K pre-seed via SAFEs, grants, crowdfunding)",
    ],
  },
  {
    company: "Indie Builder (Pottery Friends)",
    title: "Founder / PM / Dev",
    period: "Nov 2024 – Present",
    highlights: [
      "Built a community platform for ceramic studios from zero to 150-member early access beta, solo, using AI-assisted development (Claude Code) — native mobile app, web app, analytics dashboards",
      "Running structured user testing to validate PMF: retention cohorts, activation funnels, and PMF surveys against the incumbent stack (Square + group chat)",
      "Prioritized by cutting scope from data: killed a marketplace after user interviews, pivoted the home screen when engagement data contradicted the hypothesis, doubling usage",
    ],
  },
  {
    company: "Treasure DAO",
    title: "Senior PM",
    period: "Apr 2024 – Nov 2024",
    highlights: [
      "Quest v2 + Verified Actions → +30% engagement, –40% integration time",
      "New chain on Arbitrum → +20% user base, +50% tx speed, +35% devs",
    ],
  },
  {
    company: "Genies",
    title: "Founding Product Manager",
    period: "Feb 2021 – May 2022",
    highlights: [
      "First PM hire (85 people). Creator Ecosystem → contributed to $150M raise",
      "E-commerce storefront: $100K/week. Alpha community → 1K users",
    ],
  },
  {
    company: "AAA",
    title: "Digital Product Manager",
    period: "Mar 2018 – Aug 2020",
    highlights: [
      "Mobile app to 6M members — saved $2M/year shifting to self-service",
      "+30% onboarding completion via competitive analysis + A/B testing",
    ],
  },
  {
    company: "Jam City",
    title: "Product Manager",
    period: "Aug 2013 – Mar 2015",
    highlights: [
      "Scaled to 1M+ DAU, $50M revenue via live ops and monetization",
      "20% MoM revenue growth through currency optimizations",
    ],
  },
];

// Earlier roles: condensed single-line entries
const earlierRoles = [
  { company: "Mythical Games", title: "Senior Technical PM", period: "2022–2023", note: "+20% retention, +15% revenue via game services platform" },
  { company: "Bandai Namco", title: "PM", period: "2016–2017", note: "PAC-MAN: 10M+ installs/week, 1M+ MAU at launch" },
  { company: "Big Fish Games", title: "PM", period: "2017", note: "Built analytics pipeline → +20% engagement, +50% sessions" },
  { company: "Flow State Media", title: "Director of Product", period: "2015–2016", note: "8 months consecutive revenue growth, mobile games" },
  { company: "SUPERLABS", title: "PM", period: "2015", note: "VR game pre-production (acquired by Zynga)" },
  { company: "Zynga", title: "Content Manager", period: "2009–2013", note: "FarmVille + Mafia Wars; first mobile raiding feature" },
];

// Brand colors matching the portfolio website
const c = {
  indigo500: "#6366f1",
  violet500: "#8b5cf6",
  purple500: "#a855f7",
  amber500: "#f59e0b",
  emerald500: "#10b981",
  rose500: "#f43f5e",
  sky500: "#0ea5e9",
  teal500: "#14b8a6",
  indigo50: "#eef2ff",
  violet50: "#f5f3ff",
  amber50: "#fffbeb",
  emerald50: "#ecfdf5",
  rose50: "#fff1f2",
  sky50: "#f0f9ff",
  zinc900: "#18181b",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  zinc200: "#e4e4e7",
  zinc100: "#f4f4f5",
  zinc50: "#fafafa",
  white: "#ffffff",
};

// Timeline accent colors matching the website's gradient system
const roleAccents = [
  c.indigo500,
  c.violet500,
  c.amber500,
  c.emerald500,
  c.rose500,
  c.sky500,
  c.purple500,
  c.teal500,
  c.amber500,
  c.indigo500,
  c.rose500,
  c.violet500,
];

const skillAccents = [c.indigo500, c.amber500, c.emerald500, c.rose500];

const resumeMetrics = [
  { value: "15+", label: "Years Shipping" },
  { value: "$50M", label: "Revenue Driven" },
  { value: "$150M", label: "Funding Secured" },
  { value: "6M", label: "Users Reached" },
];

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: c.white,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontSize: 9,
    color: c.zinc700,
  },
  // Fixed elements (appear on every page)
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: c.zinc200,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: c.zinc400,
  },
  // Header
  header: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: c.zinc900,
    letterSpacing: -0.5,
  },
  titleBadge: {
    fontSize: 9,
    color: c.indigo500,
    backgroundColor: c.indigo50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  contactText: {
    fontSize: 8.5,
    color: c.zinc500,
  },
  contactLink: {
    fontSize: 8.5,
    color: c.indigo500,
    textDecoration: "none",
  },
  contactSep: {
    fontSize: 8.5,
    color: c.zinc300,
  },
  summary: {
    fontSize: 8.5,
    color: c.zinc600,
    lineHeight: 1.5,
    marginTop: 8,
  },
  // Divider
  divider: {
    height: 0.5,
    backgroundColor: c.zinc200,
    marginVertical: 6,
  },
  // Metrics
  metricsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: c.zinc50,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: c.zinc200,
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: c.indigo500,
  },
  metricLabel: {
    fontSize: 6.5,
    color: c.zinc500,
    marginTop: 1,
    textAlign: "center",
  },
  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 2,
    gap: 6,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.zinc900,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  // Role entries
  role: {
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: c.zinc200,
  },
  roleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  roleNameTitle: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexShrink: 1,
  },
  roleCompany: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.zinc900,
  },
  roleTitleText: {
    fontSize: 9,
    color: c.indigo500,
  },
  rolePeriod: {
    fontSize: 8,
    color: c.zinc400,
    flexShrink: 0,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 3.5,
    marginRight: 6,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 8.5,
    color: c.zinc600,
    flex: 1,
    lineHeight: 1.4,
  },
  // Skills
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillCard: {
    width: "48%",
    marginBottom: 4,
    padding: 6,
    backgroundColor: c.zinc50,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: c.zinc200,
  },
  skillAccentBar: {
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  skillCatName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: c.zinc500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  skillDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },
  skillText: {
    fontSize: 8,
    color: c.zinc700,
  },
});

const GradientBar = ({ height = 4 }: { height?: number }) => (
  <Svg width="100%" height={height}>
    <Defs>
      <SvgLinearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%" stopColor={c.indigo500} />
        <Stop offset="50%" stopColor={c.violet500} />
        <Stop offset="100%" stopColor={c.purple500} />
      </SvgLinearGradient>
    </Defs>
    <Rect x="0" y="0" width="612" height={height} fill="url(#brand)" />
  </Svg>
);

export const ResumePDF = () => (
  <Document title="Jon Martin - Senior Product Manager" author="Jon Martin">
    <Page size="LETTER" style={s.page}>
      {/* Gradient bar at top of every page */}
      <View style={s.topBar} fixed>
        <GradientBar height={4} />
      </View>

      {/* Footer on every page */}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>
          Jon Martin &middot; Senior Product Manager
        </Text>
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>

      {/* Header */}
      <View style={s.header}>
        <View style={s.nameRow}>
          <Text style={s.name}>Jon Martin</Text>
          <Text style={s.titleBadge}>Senior Product Manager</Text>
        </View>
        <View style={s.contactRow}>
          <Text style={s.contactText}>(650) 627-6352</Text>
          <Text style={s.contactSep}>|</Text>
          <Link src="mailto:jonalexjames@gmail.com">
            <Text style={s.contactLink}>jonalexjames@gmail.com</Text>
          </Link>
          <Text style={s.contactSep}>|</Text>
          <Link src="https://jonnymartin.blog">
            <Text style={s.contactLink}>jonnymartin.blog</Text>
          </Link>
        </View>
        <Text style={s.summary}>
          15-year Senior PM (Zynga, Jam City, Genies, AAA). Currently running an early access beta for Pottery Friends, built solo with AI-assisted development.
        </Text>
      </View>

      <View style={s.divider} />

      {/* Key metrics strip */}
      <View style={s.metricsRow}>
        {resumeMetrics.map((m) => (
          <View key={m.label} style={s.metricBox}>
            <Text style={s.metricValue}>{m.value}</Text>
            <Text style={s.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Experience */}
      <View style={s.sectionHeader}>
        <View
          style={[s.sectionAccent, { backgroundColor: c.indigo500 }]}
        />
        <Text style={s.sectionTitle}>Experience</Text>
      </View>

      {resumeRoles.map((role, i) => {
        const accent = roleAccents[i % roleAccents.length];
        return (
          <View
            key={`${role.company}-${role.period}`}
            style={[s.role, { borderLeftColor: accent }]}
            wrap={false}
          >
            <View style={s.roleTop}>
              <View style={s.roleNameTitle}>
                <Text style={s.roleCompany}>{role.company}</Text>
                <Text style={s.roleTitleText}>{role.title}</Text>
              </View>
              <Text style={s.rolePeriod}>{role.period}</Text>
            </View>

            {role.highlights.map((h, hi) => (
              <View key={hi} style={s.bullet}>
                <View
                  style={[s.bulletDot, { backgroundColor: accent }]}
                />
                <Text style={s.bulletText}>{h}</Text>
              </View>
            ))}
          </View>
        );
      })}

      {/* Earlier Experience, condensed */}
      <View style={[s.sectionHeader, { marginTop: 4 }]}>
        <View
          style={[s.sectionAccent, { backgroundColor: c.zinc400 }]}
        />
        <Text style={s.sectionTitle}>Earlier Experience</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        {earlierRoles.map((role) => (
          <View key={role.company} style={{ flexDirection: "row", marginBottom: 3, paddingLeft: 10 }} wrap={false}>
            <Text style={[s.bulletText, { fontFamily: "Helvetica-Bold", color: c.zinc900, width: 120 }]}>
              {role.company}
            </Text>
            <Text style={[s.bulletText, { color: c.indigo500, width: 90 }]}>
              {role.title}
            </Text>
            <Text style={[s.bulletText, { color: c.zinc400, width: 50 }]}>
              {role.period}
            </Text>
            <Text style={[s.bulletText, { flex: 1 }]}>
              {role.note}
            </Text>
          </View>
        ))}
      </View>

      {/* Skills, compact inline */}
      <View style={[s.sectionHeader, { marginTop: 4 }]}>
        <View
          style={[s.sectionAccent, { backgroundColor: c.violet500 }]}
        />
        <Text style={s.sectionTitle}>Skills</Text>
      </View>

      <View style={{ gap: 3 }}>
        {skillCategories.map((cat) => (
          <View key={cat.name} style={{ flexDirection: "row", paddingLeft: 10 }} wrap={false}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: c.zinc900, width: 120 }}>
              {cat.name}
            </Text>
            <Text style={{ fontSize: 8, color: c.zinc600, flex: 1 }}>
              {cat.skills.join("  ·  ")}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
