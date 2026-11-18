import React, { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { C, Button } from "./ui";

/**
 * Pad de firma: captura trazos como paths SVG.
 * `onChange({ paths, width, height })` o `null` cuando se borra.
 */
export default function SignaturePad({ onChange, onDrawingChange, height = 180 }) {
  const [paths, setPaths] = useState([]);
  const [current, setCurrent] = useState("");
  const [width, setWidth] = useState(0);
  const currentRef = useRef("");
  const pathsRef = useRef([]);
  const sizeRef = useRef({ width: 0, height });
  sizeRef.current = { width, height };
  const cbRef = useRef({ onChange, onDrawingChange });
  cbRef.current = { onChange, onDrawingChange };

  const responder = useMemo(() => {
    const commit = () => {
      cbRef.current.onDrawingChange?.(false);
      const d = currentRef.current;
      currentRef.current = "";
      setCurrent("");
      if (!d) {
        return;
      }
      pathsRef.current = [...pathsRef.current, d.includes("L") ? d : `${d} l0.1,0.1`];
      setPaths(pathsRef.current);
      cbRef.current.onChange?.({ paths: pathsRef.current, ...sizeRef.current });
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e) => {
        cbRef.current.onDrawingChange?.(true);
        const { locationX: x, locationY: y } = e.nativeEvent;
        currentRef.current = `M${x.toFixed(1)},${y.toFixed(1)}`;
        setCurrent(currentRef.current);
      },
      onPanResponderMove: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        currentRef.current += ` L${x.toFixed(1)},${y.toFixed(1)}`;
        setCurrent(currentRef.current);
      },
      onPanResponderRelease: commit,
      onPanResponderTerminate: commit,
    });
  }, []);

  const clear = () => {
    pathsRef.current = [];
    setPaths([]);
    onChange?.(null);
  };

  return (
    <View>
      <View
        style={[styles.pad, { height }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...responder.panHandlers}
      >
        <Svg width="100%" height="100%" pointerEvents="none">
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {current ? (
            <Path d={current} stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
        {paths.length === 0 && !current ? (
          <Text pointerEvents="none" style={styles.hint}>
            Firme aquí con el dedo
          </Text>
        ) : null}
        <View pointerEvents="none" style={styles.line} />
      </View>
      <Button title="Borrar firma" variant="ghost" small onPress={clear} style={styles.clear} />
    </View>
  );
}

/** Convierte la firma guardada en un <svg> para el PDF. */
export const signatureToSvg = (sig, w = 260, h = 90) => {
  if (!sig?.paths?.length) {
    return "";
  }
  const paths = sig.paths
    .map((d) => `<path d="${d}" stroke="#231F20" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${sig.width} ${sig.height}" preserveAspectRatio="xMinYMid meet">${paths}</svg>`;
};

const styles = StyleSheet.create({
  pad: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.line,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  hint: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    color: C.muted,
    fontSize: 16,
  },
  line: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 36,
    height: 1,
    backgroundColor: C.line,
  },
  clear: { alignSelf: "flex-end" },
  preview: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: C.line },
});

/** Vista de solo lectura de una firma guardada. */
export function SignaturePreview({ signature, height = 120 }) {
  if (!signature?.paths?.length) {
    return null;
  }
  return (
    <View style={[styles.preview, { height }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${signature.width} ${signature.height}`}>
        {signature.paths.map((d, i) => (
          <Path key={i} d={d} stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
    </View>
  );
}
