import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { career, skillCategories } from "@/lib/experience";

const c = {
  black: "#0d0d0d",
  dark: "#1a1a1a",
  body: "#2a2a2a",
  muted: "#444444",
  subtle: "#555555",
  light: "#777777",
  rule: "#c0c0c0",
  ruleLight: "#d0d0d0",
  ruleFaint: "#dddddd",
  bulletDot: "#999999",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: c.white,
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 43,
    fontSize: 8.5,
    color: c.body,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: c.dark,
    marginBottom: 8,
  },
  headerLeft: {},
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: c.black,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 10,
    color: c.subtle,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 1,
  },
  headerRight: {
    textAlign: "right",
    fontSize: 8.5,
    color: c.muted,
    lineHeight: 1.5,
  },

  /* ── Summary ── */
  summary: {
    fontSize: 8.5,
    color: "#3a3a3a",
    lineHeight: 1.45,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: c.ruleLight,
  },

  /* ── Section ── */
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: c.dark,
    borderBottomWidth: 0.75,
    borderBottomColor: c.rule,
    paddingBottom: 2,
    marginBottom: 7,
  },

  /* ── Role ── */
  role: {
    marginBottom: 7,
  },
  roleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  roleTitleLine: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
  },
  roleTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.black,
  },
  roleCompany: {
    fontSize: 9,
    color: c.subtle,
    marginLeft: 5,
  },
  rolePeriod: {
    fontSize: 8,
    color: c.light,
    flexShrink: 0,
  },

  /* ── Bullets ── */
  bulletList: {
    marginTop: 2,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: c.bulletDot,
    marginTop: 3,
    marginRight: 6,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 8.5,
    color: c.body,
    flex: 1,
    lineHeight: 1.38,
  },

  /* ── Skills ── */
  skillGroup: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  skillLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
  },
  skillValue: {
    fontSize: 8,
    color: c.muted,
    flex: 1,
  },

  /* ── Interests ── */
  interests: {
    fontSize: 8,
    color: c.light,
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: c.ruleFaint,
  },
  interestsLabel: {
    fontFamily: "Helvetica-Bold",
    color: c.subtle,
  },
});

export const ResumePDF = () => (
  <Document title="Jon Martin - Senior Product Manager" author="Jon Martin">
    <Page size="LETTER" style={s.page}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.name}>Jon Martin</Text>
          <Text style={s.title}>Senior Product Manager</Text>
        </View>
        <View style={s.headerRight}>
          <Text>(650) 627-6352</Text>
          <Text>jonalexjames@gmail.com</Text>
          <Link src="https://jonnymartin.blog" style={{ textDecoration: "none" }}>
            <Text style={{ fontSize: 8.5, color: c.muted }}>jonnymartin.blog</Text>
          </Link>
          <Text>Concord, CA</Text>
        </View>
      </View>

      {/* ── Summary ── */}
      <Text style={s.summary}>
        Senior Product Manager with 15+ years shipping consumer products at scale across gaming, consumer platforms, and enterprise mobile. Deep expertise in growth, live ops, monetization, and go-to-market strategy at companies including Zynga, Jam City, Genies, and AAA. Currently co-founding a game studio and building with AI-native workflows {"\u2014"} recently shipped a production app solo from zero to 150 early access members using modern AI tooling, combining product strategy with hands-on full-stack development.
      </Text>

      {/* ── Experience ── */}
      <Text style={s.sectionTitle}>Experience</Text>

      {career.map((role) => (
        <View
          key={`${role.company}-${role.period}`}
          style={s.role}
          wrap={false}
        >
          <View style={s.roleTop}>
            <View style={s.roleTitleLine}>
              <Text style={s.roleTitle}>{role.title}</Text>
              <Text style={s.roleCompany}>| {role.company}</Text>
            </View>
            <Text style={s.rolePeriod}>{role.period}</Text>
          </View>
          <View style={s.bulletList}>
            {role.highlights.map((h, hi) => (
              <View key={hi} style={s.bullet}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* ── Skills ── */}
      <Text style={s.sectionTitle}>Skills</Text>

      {skillCategories.map((cat) => (
        <View key={cat.name} style={s.skillGroup} wrap={false}>
          <Text style={s.skillLabel}>{cat.name}: </Text>
          <Text style={s.skillValue}>{cat.skills.join(", ")}</Text>
        </View>
      ))}

      {/* ── Interests ── */}
      <View style={s.interests}>
        <Text>
          <Text style={s.interestsLabel}>Interests: </Text>
          <Text>Ceramics, Functional Fitness, Nutrition, Urban Farming</Text>
        </Text>
      </View>

    </Page>
  </Document>
);
