import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/** Colores de la marca Holcim (logo 2021) + colores de estado. */
export const C = {
  navy: "#1D4370",
  navyDark: "#12304F",
  sky: "#04BBF1",
  green: "#94C12E",
  ink: "#16253A",
  inkSoft: "#3E4C5E",
  muted: "#7A8696",
  line: "#DDE3EA",
  bg: "#EEF2F6",
  card: "#FFFFFF",
  accent: "#0A8FC7",
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
  primary: { bg: C.navy, fg: "#fff", border: C.navy },
  sky: { bg: C.sky, fg: "#fff", border: C.sky },
  dark: { bg: C.navyDark, fg: "#fff", border: C.navyDark },
  danger: { bg: C.bad, fg: "#fff", border: C.bad },
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
  dark: { bg: C.navy, fg: "#fff" },
  light: { bg: "rgba(255,255,255,0.92)", fg: C.navy },
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

/** Degradado vertical para oscurecer la parte baja de una foto y leer el texto encima. */
export function Shade({ from = 0, to = 0.85, color = C.navyDark, style }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={from} />
            <Stop offset="1" stopColor={color} stopOpacity={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#shade)" />
      </Svg>
    </View>
  );
}

/** Vista con una foto de fondo (reemplaza a ImageBackground, deprecado en RN 0.87). */
export function PhotoBackground({ source, style, imageStyle, children }) {
  return (
    <View style={[s.bgWrap, style]}>
      <Image source={source} style={[StyleSheet.absoluteFill, s.bgImg, imageStyle]} resizeMode="cover" />
      {children}
    </View>
  );
}

/** Tarjeta con foto de fondo y contenido sobre un degradado. */
export function PhotoCard({ source, height = 170, onPress, children, style, top, radius = 16 }) {
  const body = (
    <PhotoBackground source={source} style={[s.photoCard, { height, borderRadius: radius }]}>
      <Shade from={0.05} to={0.88} style={{ borderRadius: radius }} />
      {top ? <View style={s.photoTop}>{top}</View> : null}
      <View style={s.photoBottom}>{children}</View>
    </PhotoBackground>
  );
  if (!onPress) {
    return <View style={[s.photoWrap, { borderRadius: radius }, style]}>{body}</View>;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.photoWrap, { borderRadius: radius }, pressed && s.pressed, style]}>
      {body}
    </Pressable>
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
    borderRadius: 14,
    padding: 16,
    shadowColor: "#0B1E33",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: C.line, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  photoWrap: {
    backgroundColor: C.navy,
    shadowColor: "#0B1E33",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  photoCard: { overflow: "hidden", justifyContent: "space-between" },
  bgWrap: { overflow: "hidden" },
  bgImg: { width: "100%", height: "100%" },
  photoTop: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  photoBottom: { padding: 14, marginTop: "auto" },
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
