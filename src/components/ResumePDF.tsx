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
import { career, skillCategories } from "@/lib/experience";

const c = {
  indigo500: "#6366f1",
  violet500: "#8b5cf6",
  purple500: "#a855f7",
  indigo50: "#eef2ff",
  zinc900: "#18181b",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  zinc200: "#e4e4e7",
  white: "#ffffff",
};

const accent = c.indigo500;

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: c.white,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 40,
    fontSize: 9,
    color: c.zinc700,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: c.zinc200,
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7,
    color: c.zinc400,
  },
  header: {
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: c.zinc900,
    letterSpacing: -0.5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  contactText: {
    fontSize: 8,
    color: c.zinc500,
  },
  contactLink: {
    fontSize: 8,
    color: c.indigo500,
    textDecoration: "none",
  },
  contactSep: {
    fontSize: 8,
    color: c.zinc300,
  },
  summary: {
    fontSize: 8.5,
    color: c.zinc600,
    lineHeight: 1.5,
    marginTop: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: c.zinc200,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 5,
  },
  sectionAccent: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: c.indigo500,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.zinc900,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  role: {
    marginBottom: 7,
    paddingLeft: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: c.zinc200,
  },
  roleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  roleCompany: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: c.zinc900,
  },
  roleTitle: {
    fontSize: 8.5,
    color: c.indigo500,
    marginLeft: 6,
  },
  rolePeriod: {
    fontSize: 7.5,
    color: c.zinc400,
    flexShrink: 0,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: c.zinc400,
    marginTop: 3.5,
    marginRight: 6,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 8,
    color: c.zinc600,
    flex: 1,
    lineHeight: 1.4,
  },
});

const GradientBar = ({ height = 3 }: { height?: number }) => (
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
      <View style={s.topBar} fixed>
        <GradientBar />
      </View>

      <View style={s.footer} fixed>
        <Text style={s.footerText}>Jon Martin</Text>
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.name}>Jon Martin</Text>
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
          Senior Product Manager with 15 years shipping consumer products at scale across gaming, consumer platforms, and enterprise mobile. Deep expertise in growth, live ops, monetization, and go-to-market strategy at companies like Zynga, Jam City, Genies, and AAA. Now building with AI-native workflows -- recently shipped a production app solo from zero to 150 early access members using Claude Code, combining product strategy with hands-on full-stack development.
        </Text>
      </View>

      <View style={s.divider} />

      {/* Experience */}
      <View style={s.sectionHeader}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>Experience</Text>
      </View>

      {career.map((role) => (
        <View
          key={`${role.company}-${role.period}`}
          style={s.role}
          wrap={false}
        >
          <View style={s.roleTop}>
            <View style={{ flexDirection: "row", alignItems: "baseline", flexShrink: 1 }}>
              <Text style={s.roleCompany}>{role.company}</Text>
              <Text style={s.roleTitle}>{role.title}</Text>
            </View>
            <Text style={s.rolePeriod}>{role.period}</Text>
          </View>
          {role.highlights.map((h, hi) => (
            <View key={hi} style={s.bullet}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{h}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Skills */}
      <View style={s.sectionHeader}>
        <View style={[s.sectionAccent, { backgroundColor: c.violet500 }]} />
        <Text style={s.sectionTitle}>Skills</Text>
      </View>

      <View style={{ gap: 3 }}>
        {skillCategories.map((cat) => (
          <View key={cat.name} style={{ flexDirection: "row", paddingLeft: 10 }} wrap={false}>
            <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: c.zinc900, width: 110 }}>
              {cat.name}
            </Text>
            <Text style={{ fontSize: 7.5, color: c.zinc600, flex: 1 }}>
              {cat.skills.join("  ·  ")}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
