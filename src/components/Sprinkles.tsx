import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Canvas,
  Group,
  RoundedRect,
  runTiming,
  Skia,
  useComputedValue,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import { processTransform3d, toMatrix3 } from "react-native-redash";

const colors = ["#D4A017", "#00008B"]; 
const SPRINKLE_COUNT = 70;
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const calculateSin = (yPos: number, id: number) => {
  const sineValue = Math.sin((yPos - 500) * (Math.PI / 540));
  const cosineValue = Math.cos((yPos - 500) * (Math.PI / 540));
  return id % 2 === 0 ? sineValue : -cosineValue;
};

interface SprinkleConfig {
  id: string;
  initialX: number;
  initialY: number;
  colorIndex: number;
}

const SprinkleElement = ({
  initialX,
  initialY,
  id,
  colorIndex,
}: SprinkleConfig) => {
  const ELEMENT_WIDTH = 10;
  const ELEMENT_HEIGHT = 30;
  const randomFactor = Math.random() * 4;

  const centerYValue = useValue(0);
  const yPosition = useValue(initialY);

  const elementOrigin = useComputedValue(() => {
    centerYValue.current = yPosition.current + ELEMENT_HEIGHT / 2;
    const centerX = initialX + ELEMENT_WIDTH / 2;
    return vec(centerX, centerYValue.current);
  }, [yPosition]);

  runTiming(yPosition, screenHeight * 3, {
    duration: 3500,
  });

  const transformMatrix = useComputedValue(() => {
    const rotationZ =
      calculateSin(yPosition.current, Math.round(Number(id))) *
      randomFactor *
      2.5;
    const rotationY =
      calculateSin(yPosition.current, Math.round(Number(id))) *
      randomFactor *
      1.5;
    const rotationX =
      calculateSin(yPosition.current, Math.round(Number(id))) *
      randomFactor *
      1.5;
    const matrix3D = toMatrix3(
      processTransform3d([
        { rotateY: rotationY },
        { rotateX: rotationX },
        { rotateZ: rotationZ },
      ])
    );

    return Skia.Matrix(matrix3D);
  }, [yPosition]);

  return (
    <Group matrix={transformMatrix} origin={elementOrigin}>
      <RoundedRect
        r={8}
        x={initialX}
        y={yPosition}
        height={ELEMENT_WIDTH}
        width={ELEMENT_HEIGHT}
        color={colors[colorIndex]}
      />
    </Group>
  );
};

export const Sprinkle = () => {
  const [sprinkleElements, setSprinkleElements] = useState<SprinkleConfig[]>([]);
  const [title, setTitle] = useState("React Universe 2024!");

  const startAnimation = () => {
    const elements: SprinkleConfig[] = [];

    for (let i = 0; i < SPRINKLE_COUNT; i++) {
      const initialX = Math.random() * screenWidth;
      const initialY = -Math.random() * (screenHeight * 3);
      const id = i + Math.random() + "";
      elements.push({
        id: id,
        initialX,
        initialY,
        colorIndex: i % colors.length,
      });
    }

    setSprinkleElements(elements);
  };

  const handleTitlePress = () => {
    setTitle("That's a wrap!");
  };

  return (
    <View style={styles.container}>
      <Canvas style={styles.container}>
        {sprinkleElements.map((element) => (
          <SprinkleElement key={element.id} {...element} />
        ))}
      </Canvas>
      <Pressable onPress={handleTitlePress} style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
      <Pressable onPress={startAnimation} style={styles.button}>
        <Text style={styles.buttonText}>START</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  titleContainer: {
    position: "absolute",
    top: "45%",
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: 40,
    color: "purple",
    fontWeight: "bold",
  },
  button: {
    height: 60,
    backgroundColor: "purple",
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
});
