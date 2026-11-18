import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";

export const C = {
  ink: "#231F20",
  inkSoft: "#4A4546",
  muted: "#8A8586",
  line: "#E4E1E1",
  bg: "#F4F2F2",
  card: "#FFFFFF",
  accent: "#ED1C24",
  good: "#1E8E3E",
  goodBg: "#E6F4EA",
  bad: "#C5221F",
  badBg: "#FCE8E6",
  na: "#5F6368",
  naBg: "#ECEDEF",
  warn: "#B06000",
  warnBg: "#FEF3E0",
};

const pad = (n) => String(n).padStart(2, "0");

export const fmtTime = (ts) => {
  const d = new Date(ts);
  let h = d.getHours();
  const ampm = h >= 12 ? "p. m." : "a. m.";
  h = h % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${ampm}`;
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const fmtDate = (ts) => {
  const d = new Date(ts);
  return `${pad(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

export const fmtLongDate = (ts) => {
  const d = new Date(ts);
  const day = DAYS[d.getDay()];
  return `${day[0].toUpperCase()}${day.slice(1)} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};

export const fmtDateTime = (ts) => `${fmtDate(ts)} ${fmtTime(ts)}`;

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function Button({ title, onPress, variant = "primary", disabled, loading, style, small }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && s.disabled,
        pressed && s.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[s.btnText, small && s.btnTextSmall, { color: v.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: C.accent, fg: "#fff", border: C.accent },
  dark: { bg: C.ink, fg: "#fff", border: C.ink },
  outline: { bg: "transparent", fg: C.ink, border: C.line },
  ghost: { bg: "transparent", fg: C.accent, border: "transparent" },
};

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && s.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

export function Badge({ label, tone = "na" }) {
  const t = TONES[tone];
  return (
    <View style={[s.badge, { backgroundColor: t.bg }]}>
      <Text style={[s.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const TONES = {
  good: { bg: C.goodBg, fg: C.good },
  bad: { bg: C.badBg, fg: C.bad },
  na: { bg: C.naBg, fg: C.na },
  warn: { bg: C.warnBg, fg: C.warn },
  dark: { bg: C.ink, fg: "#fff" },
};

export const CritBadge = ({ criticality }) => (
  <Badge label={`Crit. ${criticality}`} tone={criticality === "A" ? "bad" : "warn"} />
);

export function ProgressBar({ value, total, tone = C.good }) {
  const pct = total ? Math.min(1, value / total) : 0;
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: tone }]} />
    </View>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[s.section, style]}>{children}</Text>;
}

export const s = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSmall: { minHeight: 38, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { fontSize: 17, fontWeight: "700" },
  btnTextSmall: { fontSize: 14 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: C.line, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  section: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 16,
  },
});
